import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';

export interface PlayerWord {
  name: string;
  word: string;
  count: number;
}

const redis = Redis.fromEnv();
const STORAGE_KEY = 'halloween_words_session';

export async function GET() {
  try {
    const words = (await redis.get<PlayerWord[]>(STORAGE_KEY)) || [];
    return NextResponse.json(words);
  } catch (err) {
    return NextResponse.json({ error: 'Errore nel recupero dati da Redis' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, name, word } = body;
    const targetWord = body.originalWord || body.targetWord;

    let words = (await redis.get<PlayerWord[]>(STORAGE_KEY)) || [];

    // 1. Aggiunta partecipante e parola
    if (action === 'add' || action === 'register') {
      const formattedWord = word.trim().toUpperCase();
      const formattedName = name.trim();

      if (words.some((item) => item.word.toUpperCase() === formattedWord)) {
        return NextResponse.json({ error: 'Parola già rubata da un altro spirito!' }, { status: 400 });
      }

      words.push({ name: formattedName, word: formattedWord, count: 0 });
      await redis.set(STORAGE_KEY, words);
    } 
    // 2. Incremento contatore
    else if (action === 'updateCount' || action === 'increment') {
      words = words.map((item) =>
        item.word === targetWord ? { ...item, count: item.count + 1 } : item
      );
      await redis.set(STORAGE_KEY, words);
    } 
    // 3. Decremento contatore
    else if (action === 'decreaseCount' || action === 'decrement') {
      words = words.map((item) =>
        item.word === targetWord && item.count > 0 ? { ...item, count: item.count - 1 } : item
      );
      await redis.set(STORAGE_KEY, words);
    }

    return NextResponse.json(words);
  } catch (err) {
    return NextResponse.json({ error: 'Errore nel salvataggio su Redis' }, { status: 500 });
  }
}