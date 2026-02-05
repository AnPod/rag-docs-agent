import { NextResponse } from 'next/server'
import { extractTextFromFile, chunkText, generateEmbeddings, ChromaClient } from '@/lib'

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    // Parse file
    const { content, metadata } = await extractTextFromFile(file)
    
    // Chunk content
    const chunks = chunkText(content, {
      maxChunkSize: 500,
      overlap: 50
    })
    
    // Update source in metadata
    chunks.forEach(chunk => {
      chunk.metadata.source = metadata.source
    })

    // Generate embeddings
    const texts = chunks.map(c => c.content)
    const embeddings = await generateEmbeddings(texts)

    // Store in ChromaDB
    const chroma = new ChromaClient()
    await chroma.storeChunks(chunks, embeddings)

    return NextResponse.json({
      success: true,
      chunkCount: chunks.length
    })

  } catch (error) {
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
