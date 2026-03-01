import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAiCheckin } from "@/hooks/use-ai";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Bot, Send } from "lucide-react";

export function AiCheckInModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState("");
  const [hasCheckedIn, setHasCheckedIn] = useState(false);
  
  const checkinMutation = useAiCheckin();

  // Mock checking in every 10 minutes (simplified to 5 mins for demo, or triggered manually)
  useEffect(() => {
    const interval = setInterval(() => {
      setIsOpen(true);
      setHasCheckedIn(false);
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  // Expose a global method for the demo to trigger it manually
  useEffect(() => {
    // @ts-ignore
    window.triggerAiCheckin = () => {
      setIsOpen(true);
      setHasCheckedIn(false);
      setStatus("");
      checkinMutation.reset();
    };
  }, []);

  const handleSubmit = () => {
    if (!status.trim()) return;
    checkinMutation.mutate(status, {
      onSuccess: () => {
        setHasCheckedIn(true);
      }
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="glass-panel border-primary/20 sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-display text-primary">
            <Bot className="w-6 h-6" />
            Co-Pilot Check-in
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-base">
            Bi-directional accountability time! Let's sync up.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AnimatePresence mode="wait">
            {!hasCheckedIn ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                <div className="bg-primary/10 p-4 rounded-xl border border-primary/20">
                  <p className="text-foreground">
                    <span className="font-bold text-primary">AI:</span> "I'm going to help organize our next 3 topics. How are you doing with your current focus?"
                  </p>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-muted-foreground">Your Status</label>
                  <Textarea
                    placeholder="I'm feeling a bit distracted..."
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="min-h-[100px] resize-none border-white/10 focus-visible:ring-primary glass-panel"
                  />
                </div>
                
                <Button 
                  onClick={handleSubmit} 
                  disabled={checkinMutation.isPending || !status.trim()}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-bold"
                >
                  {checkinMutation.isPending ? "Syncing..." : "Sync Status"}
                  <Send className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="response"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6 text-center py-6"
              >
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4 neon-glow">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-foreground">Awesome!</h3>
                <p className="text-muted-foreground text-lg">
                  {checkinMutation.data?.message || "Thanks for checking in. Keep up the great work! We've got this."}
                </p>
                <Button 
                  onClick={() => setIsOpen(false)} 
                  variant="outline"
                  className="w-full border-primary/50 text-primary hover:bg-primary/10"
                >
                  Back to Quest
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
