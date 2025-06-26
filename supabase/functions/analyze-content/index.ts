// =============================================================================
// SUPABASE EDGE FUNCTION: AI CONTENT ANALYSIS
// File: supabase/functions/analyze-content/index.ts
// =============================================================================

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface AnalysisRequest {
  itemId: string;
  content: string;
  contentType: 'character' | 'plot' | 'research' | 'chapter';
  analysisType?: 'full' | 'conflict_only' | 'suggestions_only';
}

interface AIInsight {
  id: string;
  type: 'conflict' | 'suggestion' | 'question' | 'improvement';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  suggestion?: string;
  guidingQuestions?: string[];
  confidence: number;
  category: string;
  createdAt: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    // Get user from JWT token
    const {
      data: { user },
      error: userError
    } = await supabaseClient.auth.getUser();

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    // Check rate limiting
    const { data: canAnalyze } = await supabaseClient.rpc('check_ai_usage_limit', {
      user_uuid: user.id,
      daily_limit: 10
    });

    if (!canAnalyze) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Daily analysis limit reached. Try again tomorrow.',
          remainingAnalyses: 0
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse request body
    const body: AnalysisRequest = await req.json();
    const { itemId, content, contentType, analysisType = 'full' } = body;

    if (!content || !contentType || !itemId) {
      throw new Error('Missing required fields: content, contentType, itemId');
    }

    // Start analysis timer
    const startTime = Date.now();

    // Analyze content with OpenAI/Claude
    const insights = await analyzeContentWithAI(content, contentType, analysisType);

    // Determine overall status
    const status = determineAnalysisStatus(insights);

    // Calculate processing time
    const processingTime = Date.now() - startTime;

    // Update database with results
    const { error: updateError } = await supabaseClient
      .from('imported_items')
      .update({
        ai_insights: insights,
        ai_status: status,
        last_analyzed: new Date().toISOString(),
        analysis_count: supabaseClient.raw('analysis_count + 1')
      })
      .eq('id', itemId)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error('Failed to save analysis results');
    }

    // Increment usage counter
    await supabaseClient.rpc('increment_ai_usage', {
      user_uuid: user.id
    });

    // Return results
    const response = {
      success: true,
      insights,
      status,
      processingTime,
      usage: {
        tokensUsed: estimateTokenUsage(content),
        cost: 0.002 // Estimated cost
      }
    };

    return new Response(JSON.stringify(response), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Analysis error:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Analysis failed',
        insights: [],
        status: 'error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

// =============================================================================
// AI ANALYSIS FUNCTIONS
// =============================================================================

async function analyzeContentWithAI(
  content: string, 
  contentType: string, 
  analysisType: string
): Promise<AIInsight[]> {
  const prompt = buildAnalysisPrompt(content, contentType, analysisType);
  
  try {
    // Using OpenAI API (replace with your preferred AI service)
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are an expert writing assistant that analyzes story content and provides constructive feedback. Always respond with valid JSON.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices[0]?.message?.content;

    if (!analysisText) {
      throw new Error('No analysis received from AI');
    }

    // Parse AI response to insights
    return parseAIResponse(analysisText, contentType);

  } catch (error) {
    console.error('AI analysis error:', error);
    // Fallback to basic analysis
    return generateBasicInsights(content, contentType);
  }
}

function buildAnalysisPrompt(content: string, contentType: string, analysisType: string): string {
  const basePrompt = `Analyze this ${contentType} content and provide feedback in JSON format.`;
  
  const prompts = {
    character: `${basePrompt}

For CHARACTER analysis, focus on:
- Character development opportunities
- Missing backstory elements
- Personality consistency
- Relationship potential
- Character arc suggestions

Content: "${content.slice(0, 1500)}"

Respond with JSON containing an array of insights:
{
  "insights": [
    {
      "type": "suggestion|question|conflict|improvement",
      "severity": "low|medium|high",
      "title": "Brief title",
      "description": "Detailed description",
      "suggestion": "Specific suggestion (optional)",
      "guidingQuestions": ["Question 1", "Question 2"],
      "confidence": 85,
      "category": "development"
    }
  ]
}`,

    plot: `${basePrompt}

For PLOT analysis, focus on:
- Plot hole detection
- Pacing issues
- Conflict development
- Story logic consistency
- Missing plot elements

Content: "${content.slice(0, 1500)}"

Respond with JSON format as specified above.`,

    research: `${basePrompt}

For RESEARCH analysis, focus on:
- Information gaps
- Source credibility
- Relevant connections
- Additional research areas
- Organization suggestions

Content: "${content.slice(0, 1500)}"

Respond with JSON format as specified above.`,

    chapter: `${basePrompt}

For CHAPTER analysis, focus on:
- Structure and pacing
- Character consistency
- Plot advancement
- Scene effectiveness
- Transition quality

Content: "${content.slice(0, 1500)}"

Respond with JSON format as specified above.`
  };

  return prompts[contentType as keyof typeof prompts] || prompts.chapter;
}

function parseAIResponse(analysisText: string, contentType: string): AIInsight[] {
  try {
    // Clean up the response text
    const cleanText = analysisText.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleanText);
    
    const insights = parsed.insights || [];
    
    return insights.map((insight: any, index: number) => ({
      id: crypto.randomUUID(),
      type: insight.type || 'suggestion',
      severity: insight.severity || 'medium',
      title: insight.title || `Analysis ${index + 1}`,
      description: insight.description || 'No description provided',
      suggestion: insight.suggestion,
      guidingQuestions: insight.guidingQuestions || [],
      confidence: insight.confidence || 75,
      category: insight.category || contentType,
      createdAt: new Date().toISOString()
    }));

  } catch (error) {
    console.error('Failed to parse AI response:', error);
    // Return basic fallback insight
    return [{
      id: crypto.randomUUID(),
      type: 'improvement',
      severity: 'low',
      title: 'Analysis Complete',
      description: 'Content analyzed but detailed insights could not be generated.',
      confidence: 50,
      category: contentType,
      createdAt: new Date().toISOString()
    }];
  }
}

function generateBasicInsights(content: string, contentType: string): AIInsight[] {
  const wordCount = content.split(/\s+/).length;
  const insights: AIInsight[] = [];

  // Basic word count feedback
  if (wordCount < 50) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'suggestion',
      severity: 'medium',
      title: 'Content Length',
      description: `This ${contentType} is quite brief (${wordCount} words). Consider expanding with more detail.`,
      suggestion: 'Add more descriptive details, background information, or specific examples.',
      guidingQuestions: [
        'What additional details would help readers understand this better?',
        'Are there missing elements that should be included?'
      ],
      confidence: 80,
      category: 'development',
      createdAt: new Date().toISOString()
    });
  }

  // Content type specific suggestions
  const typeSpecificInsights = {
    character: {
      title: 'Character Development',
      description: 'Consider developing this character further with background, motivations, and relationships.',
      guidingQuestions: [
        'What drives this character?',
        'What is their biggest fear or desire?',
        'How do they relate to other characters?'
      ]
    },
    plot: {
      title: 'Plot Development',
      description: 'Consider the conflict, stakes, and resolution for this plot element.',
      guidingQuestions: [
        'What is the central conflict?',
        'What are the stakes if the protagonist fails?',
        'How does this advance the overall story?'
      ]
    },
    research: {
      title: 'Research Organization',
      description: 'Consider how this research connects to your story and what additional information might be needed.',
      guidingQuestions: [
        'How does this research apply to your story?',
        'What questions does this information raise?',
        'Are there related topics to explore?'
      ]
    },
    chapter: {
      title: 'Chapter Structure',
      description: 'Consider the chapter\'s pacing, character development, and plot advancement.',
      guidingQuestions: [
        'Does this chapter advance the plot?',
        'How do characters change or grow?',
        'What tension or conflict drives the scene?'
      ]
    }
  };

  const specific = typeSpecificInsights[contentType as keyof typeof typeSpecificInsights];
  if (specific) {
    insights.push({
      id: crypto.randomUUID(),
      type: 'question',
      severity: 'low',
      title: specific.title,
      description: specific.description,
      guidingQuestions: specific.guidingQuestions,
      confidence: 70,
      category: contentType,
      createdAt: new Date().toISOString()
    });
  }

  return insights;
}

function determineAnalysisStatus(insights: AIInsight[]): string {
  if (insights.length === 0) return 'good';
  
  const hasHighSeverity = insights.some(i => i.severity === 'high');
  const hasConflicts = insights.some(i => i.type === 'conflict');
  const hasMediumSeverity = insights.some(i => i.severity === 'medium');
  
  if (hasHighSeverity || hasConflicts) return 'conflicts';
  if (hasMediumSeverity) return 'needs_attention';
  
  return 'good';
}

function estimateTokenUsage(content: string): number {
  // Rough estimation: ~4 characters per token
  return Math.ceil(content.length / 4);
}
