import { NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export interface PlayerWord {
  name: string;
  word: string;
  count: number;
}

const STORAGE_KEY = 'halloween_words_session';

export async function GET() {
  try {
    const words = (await kv.get<PlayerWord[]>(STORAGE_KEY)) || [];
    return NextResponse.json(words);
  } catch (err) {
    return NextResponse.json({ error: 'Errore nel recupero dati' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { action, name, word, targetWord } = await req.json();
    let words = (await kv.get<PlayerWord[]>(STORAGE_KEY)) || [];

    if (action === 'register') {
      const formattedWord = word.trim().toUpperCase();
      const formattedName = name.trim();

      if (words.some((item) => item.word.toUpperCase() === formattedWord)) {
        return NextResponse.json({ error: 'Parola già reclamata da un altro spirito!' }, { status: 400 });
      }

      words.push({ name: formattedName, word: formattedWord, count: 0 });
      await kv.set(STORAGE_KEY, words);
    } 
    else if (action === 'increment') {
      words = words.map((item) =>
        item.word === targetWord ? { ...item, count: item.count + 1 } : item
      );
      await kv.set(STORAGE_KEY, words);
    } 
    else if (action === 'decrement') {
      words = words.map((item) =>
        item.word === targetWord && item.count > 0 ? { ...item, count: item.count - 1 } : item
      );
      await kv.set(STORAGE_KEY, words);
    }

    return NextResponse.json(words);
  } catch (err) {
    return NextResponse.json({ error: 'Errore nel salvataggio su KV' }, { status: 500 });
  }
}