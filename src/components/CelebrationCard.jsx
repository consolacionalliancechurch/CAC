import React, { useState, useRef } from "react";
import { format } from "date-fns";
import { Cake, Heart, Sparkles, Move } from "lucide-react";
import { motion } from "framer-motion";

const BIRTHDAY_VERSE = {
  text: "This is the day the Lord has made; let us rejoice and be glad in it.",
  ref: "Psalm 118:24"
};
const ANNIVERSARY_VERSE = {
  text: "Two are better than one... if either of them falls down, one can help the other up.",
  ref: "Ecclesiastes 4:9-10"
};

function BirthdayBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-yellow-400 via-pink-400 to-purple-500" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
      <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full bg-white/10" />
      <div className="absolute -bottom-6 -left-6 w-28 h-28 rounded-full bg-white/10" />
      {["top-4 left-6", "top-8 right-12", "bottom-16 right-8", "top-1/3 right-4", "bottom-8 left-10"].map((pos, i) => (
        <div key={i} className={`absolute ${pos} text-white/30 text-lg`}>✦</div>
      ))}
    </div>
  );
}

function AnniversaryBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-700 via-red-800 to-amber-900" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full border-4 border-white/10" />
      <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full border-4 border-white/10" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border-4 border-white/10" />
      {["top-6 left-8", "top-10 right-14", "bottom-12 right-6", "bottom-6 left-12"].map((pos, i) => (
        <div key={i} className={`absolute ${pos} text-amber-300/30 text-xl`}>♥</div>
      ))}
    </div>
  );
}

function AdjustablePhoto({ src, alt }) {
  const [offset, setOffset] = useState({ x: 50, y: 50 });
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  const onMouseDown = e => { dragging.current = true; lastPos.current = { x: e.clientX, y: e.clientY }; e.preventDefault(); };
  const onMouseMove = e => {
    if (!dragging.current) return;
    const dx = ((e.clientX - lastPos.current.x) / 96) * 100;
    const dy = ((e.clientY - lastPos.current.y) / 96) * 100;
    lastPos.current = { x: e.clientX, y: e.clientY };
    setOffset(prev => ({ x: Math.max(0, Math.min(100, prev.x - dx)), y: Math.max(0, Math.min(100, prev.y - dy)) }));
  };
  const onMouseUp = () => { dragging.current = false; };
  const onTouchStart = e => { dragging.current = true; lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchMove = e => {
    if (!dragging.current) return;
    const dx = ((e.touches[0].clientX - lastPos.current.x) / 96) * 100;
    const dy = ((e.touches[0].clientY - lastPos.current.y) / 96) * 100;
    lastPos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    setOffset(prev => ({ x: Math.max(0, Math.min(100, prev.x - dx)), y: Math.max(0, Math.min(100, prev.y - dy)) }));
  };

  return (
    <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-2xl cursor-grab active:cursor-grabbing"
      onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}
      onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onMouseUp}
      title="Drag to adjust photo position">
      <img src={src} alt={alt} draggable={false} className="w-full h-full object-cover select-none"
        style={{ objectPosition: `${offset.x}% ${offset.y}%` }} />
      <div className="absolute bottom-1 right-1 bg-black/40 rounded-full p-0.5">
        <Move className="w-3 h-3 text-white" />
      </div>
    </div>
  );
}

export default function CelebrationCard({ celebration, index = 0 }) {
  const isBirthday = celebration.type === "birthday";
  const verse = isBirthday ? BIRTHDAY_VERSE : ANNIVERSARY_VERSE;
  const dateStr = celebration.date ? format(new Date(celebration.date), "MMMM d") : "";

  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }} transition={{ duration: 0.5, delay: index * 0.07 }}>
      <div className="rounded-2xl overflow-hidden shadow-xl border border-white/10 h-full flex flex-col">
        <div className="relative h-72 flex flex-col items-center justify-end pb-6">
          {isBirthday ? <BirthdayBackground /> : <AnniversaryBackground />}
          <div className="absolute top-4 left-0 right-0 flex justify-center z-10">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-bold tracking-wider uppercase">
              {isBirthday ? <><Cake className="w-3 h-3" /> Happy Birthday</> : <><Heart className="w-3 h-3" /> Happy Anniversary</>}
            </span>
          </div>
          <div className="relative z-10 flex flex-col items-center">
            {celebration.photo ? (
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-white/30 blur-sm" />
                <div className="relative">
                  <AdjustablePhoto src={celebration.photo} alt={celebration.member_name} />
                  <div className="absolute -bottom-2 -right-2 w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-lg text-lg">
                    {isBirthday ? "🎂" : "💍"}
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative">
                <div className="absolute -inset-2 rounded-full bg-white/30 blur-sm" />
                <div className="relative w-32 h-32 rounded-full border-4 border-white shadow-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <span className="text-5xl">{isBirthday ? "🎂" : "💍"}</span>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white flex-1 flex flex-col p-6 text-center">
          <h3 className="font-heading text-xl font-bold text-gray-900 leading-tight">{celebration.member_name}</h3>
          <p className="text-sm text-gray-500 mt-1 font-medium">{dateStr}</p>
          <div className="flex items-center justify-center gap-2 my-4">
            <div className="flex-1 h-px bg-gray-100" />
            <Sparkles className="w-4 h-4 text-amber-400" />
            <div className="flex-1 h-px bg-gray-100" />
          </div>
          {celebration.message && <p className="text-sm text-gray-600 leading-relaxed mb-4">{celebration.message}</p>}
          <div className={`rounded-xl p-4 mt-auto ${isBirthday ? "bg-amber-50 border border-amber-100" : "bg-rose-50 border border-rose-100"}`}>
            <p className={`text-xs italic leading-relaxed font-medium ${isBirthday ? "text-amber-800" : "text-rose-800"}`}>"{verse.text}"</p>
            <p className={`text-xs font-bold mt-1.5 tracking-wide ${isBirthday ? "text-amber-600" : "text-rose-600"}`}>— {verse.ref}</p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}