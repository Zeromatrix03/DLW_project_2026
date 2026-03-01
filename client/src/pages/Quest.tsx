import { useState } from "react";
import { useQuestions, useSubmitAnswer } from "@/hooks/use-questions";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Trophy, 
  ChevronUp, 
  ChevronDown, 
  ChevronLeft, 
  ChevronRight, 
  Lock, 
  Unlock,
  Zap
} from "lucide-react";
import confetti from "canvas-confetti";
import { DragDropMission } from "@/components/DragDropMission";
import { FocusShield } from "@/components/FocusShield";

// Sub-Component: Tactical Launch Pad for MCQs
function TacticalLaunchPad({ options, onConfirm }: { options: string[], onConfirm: (ans: string) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  const [sequence, setSequence] = useState<string[]>([]);
  const AUTH_CODE = ["UP", "DOWN", "LEFT", "RIGHT"]; 

  const handleDir = (dir: string) => {
    if (!selected) return;
    const next = [...sequence, dir].slice(-4);
    setSequence(next);
  };

  const isLocked = JSON.stringify(sequence) !== JSON.stringify(AUTH_CODE);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <p className="text-[10px] text-primary/60 uppercase font-bold tracking-widest">Available Cores</p>
          {options.map(opt => (
            <div 
              key={opt}
              onClick={() => setSelected(opt)}
              className={`p-3 border rounded-lg cursor-pointer transition-all text-sm font-bold ${
                selected === opt ? 'bg-primary/20 border-primary text-primary shadow-[0_0_10px_rgba(0,240,255,0.2)]' : 'bg-white/5 border-white/10 text-white/50 hover:border-white/20'
              }`}
            >
              {opt}
            </div>
          ))}
        </div>
        <div className="border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center p-4 bg-black/20">
          <p className="text-[9px] uppercase text-white/30 mb-2">Selection Port</p>
          {selected ? <span className="text-primary font-bold text-center">{selected}</span> : <span className="text-white/10 text-[10px] italic">No Core Inserted</span>}
        </div>
      </div>

      <div className={`p-4 bg-black/60 border rounded-xl transition-all duration-500 ${selected ? 'opacity-100' : 'opacity-20 pointer-events-none'}`}>
        <div className="flex justify-between items-center mb-4">
          <span className="text-[10px] uppercase text-primary font-black tracking-widest">Authorization Pad</span>
          {!isLocked ? <Unlock className="text-green-500 w-4 h-4 animate-pulse" /> : <Lock className="text-red-500 w-4 h-4" />}
        </div>
        <div className="grid grid-cols-3 gap-2 w-28 mx-auto">
          <div /> <Button size="sm" variant="outline" className="border-primary/20" onClick={() => handleDir("UP")}><ChevronUp className="w-4 h-4"/></Button> <div />
          <Button size="sm" variant="outline" className="border-primary/20" onClick={() => handleDir("LEFT")}><ChevronLeft className="w-4 h-4"/></Button>
          <div className="rounded-full bg-primary/5 flex items-center justify-center text-[8px] text-primary/40">AUTH</div>
          <Button size="sm" variant="outline" className="border-primary/20" onClick={() => handleDir("RIGHT")}><ChevronRight className="w-4 h-4"/></Button>
          <div /> <Button size="sm" variant="outline" className="border-primary/20" onClick={() => handleDir("DOWN")}><ChevronDown className="w-4 h-4"/></Button> <div />
        </div>
      </div>

      <Button 
        className="w-full h-12 bg-primary hover:bg-primary/80 text-black font-black italic tracking-tighter" 
        disabled={isLocked} 
        onClick={() => onConfirm(selected!)}
      >
        CONFIRM LAUNCH SEQUENCE
      </Button>
    </div>
  );
}

export default function Quest() {
  const { data: questions, isLoading } = useQuestions();
  const submitMutation = useSubmitAnswer();
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isShieldActive, setIsShieldActive] = useState(true);
  const [result, setResult] = useState<any>(null);
  
  const currentQuestion = questions?.[currentIndex];
  
  const handleSubmit = (answer: string) => {
    if (!currentQuestion) return;
    submitMutation.mutate(
      { questionId: currentQuestion.id, answer },
      { onSuccess: (data) => {
          setResult(data);
          if (data.isCorrect) confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }}
    );
  };

  if (isLoading) return <div className="h-full flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;

  if (!questions || questions.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <Zap className="w-16 h-16 text-primary animate-pulse" />
        <h2 className="text-2xl font-bold text-white uppercase italic">Command Center Offline</h2>
        <p className="text-muted-foreground max-w-xs text-sm">No active missions detected. Deploy data via SQL to begin.</p>
      </div>
    );
  }

  if (currentIndex >= questions.length && !result) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-6">
        <Trophy className="w-16 h-16 text-primary shadow-[0_0_20px_rgba(0,240,255,0.4)]" />
        <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter">Objective Secured</h2>
        <Button onClick={() => window.location.href = '/'} variant="secondary">Back to Command Center</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 font-mono">
      {!result && <FocusShield duration={60} onExpire={() => setIsShieldActive(false)} />}

      <AnimatePresence mode="wait">
        <motion.div key={currentQuestion.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <Card className="glass-panel p-6 border-white/10 bg-black/40 relative overflow-hidden shadow-2xl">
            {/* FIXED LINE 138 BELOW: Added closing brace for currentQuestion.type */}
            <div className="text-[10px] font-bold text-primary/60 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">
              Sector: {currentQuestion.topic} // Mission Type: {currentQuestion.type}
            </div>

            {!result ? (
              <>
                {currentQuestion.type === 'drag_drop' ? (
                  <DragDropMission 
                    content={currentQuestion.content}
                    metadata={currentQuestion.metadata as any}
                    onAnswer={handleSubmit}
                  />
                ) : (
                  <>
                    <h2 className="text-xl font-bold text-white mb-8 leading-tight">{currentQuestion.content}</h2>
                    <TacticalLaunchPad 
                      options={currentQuestion.options as string[]} 
                      onConfirm={handleSubmit} 
                    />
                  </>
                )}
              </>
            ) : (
              <div className="space-y-6">
                <div className={`p-6 rounded-xl border-2 ${result.isCorrect ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                  <p className="font-black uppercase tracking-widest text-sm mb-3">
                    {result.isCorrect ? ">> DATA SYNC SUCCESSFUL" : ">> CRITICAL TRANS ERROR"}
                  </p>
                  <p className="text-sm text-white/80 leading-relaxed">{result.explanation}</p>
                </div>
                <div className="flex gap-4 text-center">
                   <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                      <p className="text-[9px] uppercase text-white/40">XP Gained</p>
                      <p className="text-lg font-bold text-primary">+{result.isCorrect ? (isShieldActive ? 15 : 10) : 0}</p>
                   </div>
                   <div className="flex-1 bg-white/5 p-3 rounded border border-white/10">
                      <p className="text-[9px] uppercase text-white/40">Integrity</p>
                      <p className="text-lg font-bold text-orange-500">{result.newStreak}🔥</p>
                   </div>
                </div>
                <Button onClick={() => { setResult(null); setCurrentIndex(prev => prev + 1); }} className="w-full bg-secondary hover:bg-secondary/80 text-black font-black">
                  PROCEED TO NEXT OBJECTIVE <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>
            )}
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}