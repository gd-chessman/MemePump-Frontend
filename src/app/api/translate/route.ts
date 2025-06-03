import { NextResponse } from 'next/server';
import translate from 'translate';

export async function POST(request: Request) {
  try {
    const { text, sourceLanguage, targetLanguage } = await request.json();

    if (!text || !targetLanguage) {
      return NextResponse.json(
        { error: 'Text and target language are required' },
        { status: 400 }
      );
    }

    const translation = await translate(text, { 
      from: sourceLanguage,
      to: targetLanguage 
    });

    if (!translation) {
      throw new Error('No translation received');
    }

    return NextResponse.json({ translation });
  } catch (error) {
    console.error('Translation error:', error);
    return NextResponse.json(
      { error: 'Translation failed' },
      { status: 500 }
    );
  }
} 