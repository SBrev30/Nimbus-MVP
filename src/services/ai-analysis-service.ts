// supabase/functions/analyze-content/index.ts
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

interface AnalysisRequest {
  content: string;
  contentType: 'character' | 'plot' | 'research' | 'chapter';
  itemId: string;
}

interface AIInsight {
  type: string;
  summary: string;
  suggestions: string[];
  confidence: number;
  details?: Record<string, any>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { content, contentType, itemId } = await req.json() as AnalysisRequest;
    
    if (!content || !contentType || !itemId) {
      throw new Error('Missing required fields');
    }

    // Update status to analyzing
    await supabase
      .from('imported_items')
      .update({ ai_status: 'analyzing' })
      .eq('id', itemId);

    // Analyze content based on type
    const insights = await analyzeContent(content, contentType);

    // Update with results
    await supabase
      .from('imported_items')
      .update({ 
        ai_insights: insights,
        ai_status: 'completed',
        last_analyzed: new Date().toISOString()
      })
      .eq('id', itemId);

    return new Response(
      JSON.stringify({ success: true, insights }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Analysis error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Analysis failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});

async function analyzeContent(content: string, contentType: string): Promise<AIInsight[]> {
  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  
  if (!openaiApiKey) {
    throw new Error('OpenAI API key not configured');
  }

  const prompts = {
    character: `Analyze this character content and provide insights:
    
Content: ${content.slice(0, 2000)}

Provide analysis in this JSON format:
{
  "insights": [
    {
      "type": "character_development",
      "summary": "Brief summary of character analysis",
      "suggestions": ["suggestion1", "suggestion2"],
      "confidence": 0.8,
      "details": {
        "strengths": ["strength1"],
        "weaknesses": ["weakness1"],
        "development_potential": ["potential1"]
      }
    }
  ]
}`,

    plot: `Analyze this plot content for story structure and coherence:
    
Content: ${content.slice(0, 2000)}

Provide analysis in this JSON format:
{
  "insights": [
    {
      "type": "plot_structure",
      "summary": "Brief summary of plot analysis", 
      "suggestions": ["suggestion1", "suggestion2"],
      "confidence": 0.8,
      "details": {
        "pacing": "assessment",
        "conflicts": ["conflict1"],
        "resolution": "assessment"
      }
    }
  ]
}`,

    research: `Analyze this research content for completeness and organization:
    
Content: ${content.slice(0, 2000)}

Provide analysis in this JSON format:
{
  "insights": [
    {
      "type": "research_quality",
      "summary": "Brief summary of research analysis",
      "suggestions": ["suggestion1", "suggestion2"], 
      "confidence": 0.8,
      "details": {
        "completeness": "assessment",
        "sources": ["source1"],
        "gaps": ["gap1"]
      }
    }
  ]
}`,

    chapter: `Analyze this chapter content for writing quality and narrative flow:
    
Content: ${content.slice(0, 2000)}

Provide analysis in this JSON format:
{
  "insights": [
    {
      "type": "writing_quality",
      "summary": "Brief summary of chapter analysis",
      "suggestions": ["suggestion1", "suggestion2"],
      "confidence": 0.8,
      "details": {
        "narrative_flow": "assessment",
        "dialogue": "assessment", 
        "description": "assessment"
      }
    }
  ]
}`
  };

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${openaiApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'user',
          content: prompts[contentType as keyof typeof prompts]
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.statusText}`);
  }

  const result = await response.json();
  const aiResponse = result.choices[0].message.content;
  
  try {
    const parsed = JSON.parse(aiResponse);
    return parsed.insights || [];
  } catch {
    // Fallback if JSON parsing fails
    return [{
      type: 'analysis_error',
      summary: 'Unable to parse AI response',
      suggestions: ['Try analyzing again'],
      confidence: 0.1
    }];
  }
}
