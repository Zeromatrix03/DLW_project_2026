import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

interface DragDropMissionProps {
  content: string;
  metadata?: { // Changed to optional to handle missing data
    items: string[];
    categories: string[];
  };
  onAnswer: (answer: string) => void;
}

export function DragDropMission({ content, metadata, onAnswer }: DragDropMissionProps) {
  // 1. SAFETY DEFAULTS: Extract data safely or provide empty arrays
  const categories = metadata?.categories ?? [];
  const items = metadata?.items ?? [];

  // 2. INITIALIZE STATE: Safely use the categories
  const [sortedItems, setSortedItems] = useState<{ [key: string]: string[] }>(() => 
    Object.fromEntries(categories.map(cat => [cat, []]))
  );
  const [unassigned, setUnassigned] = useState(items);

  // 3. EFFECT: Reset state if metadata changes (important for moving between questions)
  useEffect(() => {
    setSortedItems(Object.fromEntries(categories.map(cat => [cat, []])));
    setUnassigned(items);
  }, [metadata]);

  const handleAssign = (item: string, category: string) => {
    setUnassigned(prev => prev.filter(i => i !== item));
    setSortedItems(prev => ({
      ...prev,
      [category]: [...prev[category], item]
    }));
  };

  const submitMission = () => {
    const answerString = Object.entries(sortedItems)
      .map(([cat, items]) => items.map(i => `${i}:${cat}`).join(", "))
      .filter(s => s !== "")
      .join(", ");
    onAnswer(answerString);
  };

  // 4. CRASH PREVENTION: Show a warning instead of a white screen if data is bad
  if (!metadata || categories.length === 0) {
    return (
      <div className="p-4 border border-red-500/50 bg-red-500/10 rounded-lg text-red-500 font-mono text-sm">
        [ERROR]: MISSION DATA CORRUPTED. METADATA NOT FOUND.
        <p className="mt-2 text-white/60">Run the SQL injection to populate valid missions.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-4 font-mono">
      <div className="border-l-4 border-primary pl-4 py-2 bg-primary/10">
        <h3 className="text-lg font-bold uppercase tracking-tighter">{content}</h3>
      </div>
      
      {/* Tactical Data Bank */}
      <div className="bg-black/40 p-4 border border-primary/30 rounded-lg min-h-[80px]">
        <p className="text-[10px] text-primary/60 mb-2 uppercase">Unassigned Tactical Data</p>
        <div className="flex flex-wrap gap-2">
          <AnimatePresence>
            {unassigned.map(item => (
              <motion.div 
                key={item} 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, x: 20 }}
                className="bg-primary/20 border border-primary text-primary px-3 py-1 rounded-sm text-xs font-bold"
              >
                {item}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Deployment Modules */}
      <div className="grid grid-cols-2 gap-4">
        {categories.map(category => (
          <div key={category} className="bg-zinc-900 border border-white/10 rounded-lg p-3">
            <h4 className="text-[10px] text-center text-white/40 uppercase mb-3 border-b border-white/5 pb-1">
              {category} Module
            </h4>
            <div className="space-y-2 min-h-[100px]">
              {sortedItems[category]?.map(item => (
                <div key={item} className="bg-white/5 border border-white/10 p-2 rounded text-[10px] text-center">
                  {item}
                </div>
              ))}
              {unassigned.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full text-[10px] border-dashed border-primary/40 hover:bg-primary/20"
                  onClick={() => handleAssign(unassigned[0], category)}
                >
                  DEPLOY HERE
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      <Button 
        className="w-full bg-primary hover:bg-primary/80 text-black font-black italic tracking-tighter"
        onClick={submitMission}
        disabled={unassigned.length > 0}
      >
        EXECUTE TACTICAL SORT
      </Button>
    </div>
  );
}