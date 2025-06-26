import mammoth from 'mammoth'

export interface ProcessedFile {
  title: string
  content: string
  wordCount: number
  suggestedType: 'character' | 'plot' | 'research' | 'chapter'
}

export async function processFile(file: File): Promise<ProcessedFile> {
  const title = file.name.replace(/\.(docx|txt)$/i, '')
  let content = ''
  
  try {
    if (file.name.toLowerCase().endsWith('.docx')) {
      const arrayBuffer = await file.arrayBuffer()
      const result = await mammoth.convertToHtml({ arrayBuffer })
      content = result.value
    } else if (file.name.toLowerCase().endsWith('.txt')) {
      content = await file.text()
    } else {
      throw new Error('Unsupported file type')
    }
    
    const wordCount = countWords(content)
    const suggestedType = suggestContentType(title, content, wordCount)
    
    return {
      title,
      content,
      wordCount,
      suggestedType
    }
  } catch (error) {
    console.error('Error processing file:', error)
    throw new Error(`Failed to process ${file.name}`)
  }
}

function countWords(text: string): number {
  // Remove HTML tags for word count
  const plainText = text.replace(/<[^>]*>/g, ' ')
  return plainText.trim() ? plainText.trim().split(/\s+/).length : 0
}

function suggestContentType(title: string, content: string, wordCount: number): 'character' | 'plot' | 'research' | 'chapter' {
  const titleLower = title.toLowerCase()
  const contentLower = content.toLowerCase()
  
  // Character indicators
  const characterKeywords = ['character', 'protagonist', 'personality', 'appearance', 'backstory', 'motivation']
  if (characterKeywords.some(keyword => titleLower.includes(keyword) || contentLower.includes(keyword))) {
    return 'character'
  }
  
  // Plot indicators
  const plotKeywords = ['plot', 'outline', 'scene', 'chapter', 'story', 'narrative', 'structure']
  if (plotKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'plot'
  }
  
  // Research indicators
  const researchKeywords = ['research', 'notes', 'reference', 'world', 'setting', 'background']
  if (researchKeywords.some(keyword => titleLower.includes(keyword))) {
    return 'research'
  }
  
  // Default to chapter if it's long prose
  if (wordCount > 500) {
    return 'chapter'
  }
  
  // Default fallback
  return 'research'
}

export function validateFile(file: File): { valid: boolean; error?: string } {
  const maxSize = 10 * 1024 * 1024 // 10MB
  const allowedTypes = ['.docx', '.txt']
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'))
  if (!allowedTypes.includes(fileExtension)) {
    return { valid: false, error: 'Only .docx and .txt files are supported' }
  }
  
  return { valid: true }
}
