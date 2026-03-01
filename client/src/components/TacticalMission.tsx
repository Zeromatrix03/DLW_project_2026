import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";

interface TacticalMissionProps {
  question: any;
  onAnswer: (answer: string) => void;
}

export function TacticalMission({ question, onAnswer }: TacticalMissionProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [inputSequence, setInputSequence] = useState<string[]>([]);
  const [isAuthorized, setIsAuthorized] = useState(false);

  // Define the required Launch Code for this mission
  const REQUIRED_SEQUENCE = ["UP", "DOWN", "LEFT", "RIGHT"];

  const handleDirection = (dir: string) => {
    if (!selectedOption) return;
    const newSeq = [...inputSequence, dir].slice(-4);
    setInputSequence(newSeq);
    
    if (JSON.stringify(newSeq) === JSON.stringify(REQUIRED_SEQUENCE)) {
      setIsAuthorized(true);
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {/* 1. Drag & Drop Selection Zone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          <p className="text-[10px] text-primary/60 uppercase font-bold">Available Data Cores</p>
          {question.options.map((opt: string) => (
            <motion.div
              key={opt}
              drag
              dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                // If dragged significantly to the right, select it
                if (info.offset.x > 100) setSelectedOption(opt);
              }}
              className={`p-4 border-2 rounded-lg cursor-grab active:cursor-grabbing transition-colors ${
                selectedOption === opt ? 'bg-primary/20 border-primary text-primary' : 'bg-white/5 border-white/10 text-white/70'
              }`}
            >
              {opt}
            </motion.div>
          ))}
        </div>

        <div className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-6 ${selectedOption ? 'border-primary bg-primary/5' : 'border-white/10'}`}>
          <p className="text-[10px] uppercase mb-4">Selection Port</p>
          {selectedOption ? (
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} className="text-xl font-black text-primary">
              {selectedOption}
            </motion.div>
          ) : (
            <p className="text-white/20 text-xs italic text-center">Drag a Core right to insert</p>
          )}
        </div>
      </div>

      {/* 2. Directional Authorization Pad */}
      <div className={`p-6 bg-black/40 border rounded-2xl transition-all ${selectedOption ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-6">
          <p className="text-[10px] uppercase font-bold tracking-widest text-primary">Authorization Sequence Required</p>
          {isAuthorized ? <Unlock className="text-green-500 w-5 h-5" /> : <Lock className="text-red-500 w-5 h-5" />}
        </div>

        <div className="grid grid-cols-3 gap-2 w-32 mx-auto mb-6">
          <div /> <ArrowBtn dir="UP" icon={<ChevronUp />} onClick={handleDirection} /> <div />
          <ArrowBtn dir="LEFT" icon={<ChevronLeft />} onClick={handleDirection} />
          <div className="bg-white/5 rounded-full" />
          <ArrowBtn dir="RIGHT" icon={<ChevronRight />} onClick={handleDirection} />
          <div /> <ArrowBtn dir="DOWN" icon={<ChevronDown />} onClick={handleDirection} /> <div />
        </div>

        <div className="flex justify-center gap-2 h-2">
          {inputSequence.map((_, i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-primary animate-pulse" />
          ))}
        </div>
      </div>

      <Button 
        className="w-full h-14 bg-primary text-black font-black italic tracking-tighter disabled:opacity-30"
        disabled={!isAuthorized}
        onClick={() => onAnswer(selectedOption!)}
      >
        INITIATE LAUNCH
      </Button>
    </div>
  );
}

function ArrowBtn({ dir, icon, onClick }: { dir: string,