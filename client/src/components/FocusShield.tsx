import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Shield, ShieldAlert } from "lucide-react";

export function FocusShield({ duration, onExpire }: { duration: number, onExpire: () => void }) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const percentage = (timeLeft / duration) * 100;

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpire();
      return;
    }
    const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  return (
    <div className="flex items-center gap-4 bg-black/40 p-3 border border-primary/20 rounded-xl mb-6">
      <div className="relative">
        {percentage > 20 ? <Shield className="text-primary w-6 h-6" /> : <ShieldAlert className="text-red-500 w-6 h-6 animate-pulse" />}
      </div>
      <div className="flex-1 space-y-1">
        <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-primary/60">
          <span>Shield Integrity</span>
          <span>{timeLeft}s</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div 
            className={`h-full ${percentage > 20 ? 'bg-primary' : 'bg-red-500'}`}
            initial={{ width: "100%" }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "linear" }}
          />
        </div>
      </div>
    </div>
  );
}