import { useUser } from "@/hooks/use-user";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Flame, 
  Star, 
  Crosshair, 
  ArrowRight,
  TrendingUp,
  Award
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function Dashboard() {
  const { data: user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
        <h2 className="text-2xl font-bold font-display text-destructive">User not found</h2>
        <p className="text-muted-foreground">Database might need seeding.</p>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // Calculate progress to next rank (mock logic)
  const rankProgress = (user.points % 1000) / 10;

  return (
    <motion.div 
      className="max-w-5xl mx-auto space-y-8"
      variants={container}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={item} className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl md:text-5xl font-display font-bold text-white mb-2">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">{user.displayName}</span>!
          </h1>
          <p className="text-lg text-muted-foreground">
            Ready to conquer your next learning objective?
          </p>
        </div>
        <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-[0_0_20px_-5px_hsl(var(--primary))] hover:shadow-[0_0_30px_-5px_hsl(var(--primary))] transition-all">
          <Link href="/quest">
            Start Quest <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </Button>
      </motion.div>

      {/* Focus Goal Section */}
      <motion.div variants={item} className="glass-panel rounded-2xl p-6 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="flex items-start gap-4 relative z-10">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Crosshair className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-1">Current Focus Goal</h3>
            <p className="text-xl text-white font-medium">
              {user.focusGoal || "No active focus goal. Set one during your next check-in!"}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div variants={item} className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50" />
          <div className="w-14 h-14 bg-yellow-400/10 rounded-full flex items-center justify-center mb-2">
            <Trophy className="w-7 h-7 text-yellow-400" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white">{user.points}</h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Total Points</p>
        </motion.div>

        <motion.div variants={item} className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent opacity-50" />
          <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Star className="w-7 h-7 text-primary" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white">{user.rank}</h3>
          <div className="w-full max-w-[150px] space-y-2 mt-2">
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: `${rankProgress}%` }} />
            </div>
            <p className="text-xs text-muted-foreground text-right">{Math.round(rankProgress)}% to next rank</p>
          </div>
        </motion.div>

        <motion.div variants={item} className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent opacity-50" />
          <div className="w-14 h-14 bg-orange-500/10 rounded-full flex items-center justify-center mb-2">
            <Flame className="w-7 h-7 text-orange-500" />
          </div>
          <h3 className="text-3xl font-display font-bold text-white">{user.currentStreak} <span className="text-lg text-muted-foreground">🔥</span></h3>
          <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold">Current Streak</p>
          {user.highestStreak > 0 && (
            <p className="text-xs text-muted-foreground mt-1">Best: {user.highestStreak}</p>
          )}
        </motion.div>
      </div>
      
      {/* Visual Space Detail */}
      <motion.div variants={item} className="h-32 rounded-2xl border border-white/5 bg-gradient-to-b from-transparent to-white/5 flex items-center justify-center mt-12 relative overflow-hidden">
        {/* Placeholder for future cosmetic showcase or visual flair */}
        <div className="absolute inset-0 flex items-center justify-center opacity-20">
          <Award className="w-48 h-48 text-primary blur-xl" />
        </div>
        <p className="text-muted-foreground italic relative z-10 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-secondary" />
          "Every great commander starts as a recruit."
        </p>
      </motion.div>
      
    </motion.div>
  );
}
