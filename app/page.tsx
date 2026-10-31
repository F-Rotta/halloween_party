"use client"
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type WordData = { name: string; word: string; count: number };

export default function HalloweenGame() {
  const [step, setStep] = useState<"landing" | "form" | "dashboard">("landing");
  const [wordsList, setWordsList] = useState<WordData[]>([]);
  const [myName, setMyName] = useState("");
  const [myWord, setMyWord] = useState("");
  const [isLocked, setIsLocked] = useState(false);

  // Carica i dati e controlla la memoria locale all'avvio
  useEffect(() => {
    fetchWords();
    const localWord = localStorage.getItem("maledizione_scelta");
    if (localWord) {
      setIsLocked(true);
      setStep("dashboard");
    }
  }, []);

 const fetchWords = async () => {
    try {
      const res = await fetch("/api/words");
      if (!res.ok) return;
      const data = await res.json();
      if (Array.isArray(data)) {
        setWordsList(data);
      }
    } catch (e) {
      console.error("Errore fetch words:", e);
    }
  };

  const handleConfirm = async () => {
    if (!myName || !myWord) return alert("Inserisci nome e parola!");
    if (wordsList.some((w) => w.word.toLowerCase() === myWord.toLowerCase())) {
      return alert("Questa parola è già stata rubata da un'altra anima!");
    }

    const doubleConfirm = window.confirm(
      `Sei sicuro di voler scegliere "${myWord.toUpperCase()}"? Non potrai più cambiarla per tutta la notte.`
    );

    if (doubleConfirm) {
      await fetch("/api/words", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "add", name: myName, word: myWord }),
      });
      localStorage.setItem("maledizione_scelta", myWord);
      setIsLocked(true);
      fetchWords();
      setStep("dashboard");
    }
  };

  const updateCount = async (originalWord: string, type: "updateCount" | "decreaseCount") => {
    await fetch("/api/words", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: type, originalWord }),
    });
    fetchWords();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6 font-sans selection:bg-orange-500/30">
      
      {/* 1. LANDING PAGE */}
      {step === "landing" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-2xl mx-auto mt-20">
          <h1 className="text-5xl font-bold text-orange-500 mb-8 text-center drop-shadow-lg">Il Patto delle Parole Maledette 🎃</h1>
          <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl space-y-4 text-lg">
            <p><strong>L'Evocazione:</strong> Scegli una Parola Proibita. Non sono ammessi doppioni e non si torna indietro.</p>
            <p><strong>La Maledizione:</strong> Se durante la notte qualcuno pronuncia la tua parola, la maledizione si attiva.</p>
            <p><strong>Il Rituale del Calderone:</strong> Chi ha pronunciato la parola, <em>tranne te</em>, drovrà pescare un biglietto del destino.</p>
            <button 
              onClick={() => setStep(isLocked ? "dashboard" : "form")}
              className="w-full mt-8 bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 rounded-xl transition-all"
            >
              Sigilla il Patto
            </button>
          </div>
        </motion.div>
      )}

      {/* 2. FORM INSERIMENTO */}
      {step === "form" && (
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="max-w-xl mx-auto mt-20">
          <h2 className="text-3xl text-orange-400 font-bold mb-6 text-center">Scegli la tua Maledizione</h2>
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl space-y-6">
            <div>
              <label className="block text-sm mb-2 text-slate-400">Il tuo nome</label>
              <input type="text" onChange={(e) => setMyName(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none" />
            </div>
            <div>
              <label className="block text-sm mb-2 text-slate-400">La Parola Proibita</label>
              <input type="text" onChange={(e) => setMyWord(e.target.value)} className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 text-white focus:border-orange-500 outline-none uppercase" />
            </div>
            
            <div className="pt-4">
              <h3 className="text-sm text-slate-500 mb-2">Parole già occupate dagli altri:</h3>
              <div className="flex flex-wrap gap-2">
                {wordsList.length === 0 ? <span className="text-xs text-slate-600">Nessuna parola scelta finora.</span> : null}
                {wordsList.map((w, i) => (
                  <span key={i} className="px-3 py-1 bg-slate-800 text-slate-400 rounded-full text-sm line-through">
                    {w.word.toUpperCase()}
                  </span>
                ))}
              </div>
            </div>

            <button onClick={handleConfirm} className="w-full bg-red-800 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors">
              Conferma Definitivamente
            </button>
          </div>
        </motion.div>
      )}

      {/* 3. DASHBOARD / BENTO GRID */}
      {step === "dashboard" && (
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="max-w-6xl mx-auto mt-10">
          <h2 className="text-4xl text-center text-orange-500 font-bold mb-12">Il Grimorio della Serata</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {wordsList.map((item, index) => (
              <motion.div 
                key={index}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between overflow-hidden"
              >
                {/* Effetto finto Spotlight stile Aceternity */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="z-10">
                  <p className="text-slate-500 text-sm mb-1">{item.name} ha scelto:</p>
                  <h3 className="text-3xl font-black text-white uppercase tracking-wider mb-6">{item.word}</h3>
                </div>

                <div className="z-10 flex items-center justify-between bg-slate-950 p-2 rounded-xl border border-slate-800">
                  <button onClick={() => updateCount(item.word, "decreaseCount")} className="w-8 h-8 flex items-center justify-center bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-300">-</button>
                  <span className="text-xl font-bold text-orange-400">{item.count}</span>
                  <button onClick={() => updateCount(item.word, "updateCount")} className="w-8 h-8 flex items-center justify-center bg-orange-900 hover:bg-orange-800 rounded-lg text-orange-200">+</button>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
}