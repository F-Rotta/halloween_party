import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export interface PlayerWord {
  name: string;
  word: string;
  count: number;
}

// Inizializza leggendo sia le variabili UPSTASH sia quelle KV di Vercel
const redis = new Redis({
  url: process.env.HALLOWEEN_PARTY_KV_REST_API_URL || process.env.KV_REST_API_URL || '',
  token: process.env.HALLOWEEN_PARTY_KV_REST_API_TOKEN || process.env.KV_REST_API_TOKEN || '',
});

const STORAGE_KEY = 'halloween_words_session';

export async function GET() {
  try {
    const words = (await redis.get<PlayerWord[]>(STORAGE_KEY)) || [];
    return NextResponse.json(Array.isArray(words) ? words : []);
  } catch (err: any) {
    console.error('Errore Redis GET:', err?.message || err);
    return NextResponse.json({ error: 'Errore connessione database', details: err?.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, name, word } = body;
    const targetWord = body.originalWord || body.targetWord;

    const current = await redis.get<PlayerWord[]>(STORAGE_KEY);
    let words: PlayerWord[] = Array.isArray(current) ? current : [];

    if (action === 'add' || action === 'register') {
      const formattedWord = word.trim().toUpperCase();
      const formattedName = name.trim();

      if (words.some((item) => item.word.toUpperCase() === formattedWord)) {
        return NextResponse.json({ error: 'Parola già rubata!' }, { status: 400 });
      }

      words.push({ name: formattedName, word: formattedWord, count: 0 });
      await redis.set(STORAGE_KEY, words);
    } else if (action === 'updateCount' || action === 'increment') {
      words = words.map((item) =>
        item.word === targetWord ? { ...item, count: item.count + 1 } : item
      );
      await redis.set(STORAGE_KEY, words);
    } else if (action === 'decreaseCount' || action === 'decrement') {
      words = words.map((item) =>
        item.word === targetWord && item.count > 0 ? { ...item, count: item.count - 1 } : item
      );
      await redis.set(STORAGE_KEY, words);
    }

    return NextResponse.json(words);
  } catch (err: any) {
    console.error('Errore Redis POST:', err?.message || err);
    return NextResponse.json({ error: 'Errore salvataggio', details: err?.message }, { status: 500 });
  }
}