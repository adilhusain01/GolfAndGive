import { Target, Trophy, Heart, ArrowRight } from "lucide-react";

const STEPS = [
  {
    icon:  Target,
    step:  "01",
    title: "Enter your scores",
    desc:  "Log your latest Stableford rounds (1–45 pts). Your 5 most recent scores form your monthly entry.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon:  Trophy,
    step:  "02",
    title: "Enter the monthly draw",
    desc:  "Your scores are matched against the monthly winning numbers. Match 3, 4 or all 5 to win prizes.",
    color: "bg-amber-500/10 text-amber-500",
  },
  {
    icon:  Heart,
    step:  "03",
    title: "Give to charity",
    desc:  "A portion of your subscription goes directly to the charity you chose. Every month, automatically.",
    color: "bg-rose-500/10 text-rose-500",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-3">How Golf & Give works</h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Three simple steps. Every month. Real impact.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connector line (desktop) */}
          <div className="hidden md:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-border" />

          {STEPS.map(({ icon: Icon, step, title, desc, color }, i) => (
            <div key={step} className="relative text-center">
              <div className={`mx-auto mb-5 size-20 rounded-2xl ${color} flex items-center justify-center relative z-10 bg-background`}>
                <div className={`size-16 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon className="size-7" />
                </div>
              </div>
              <span className="text-xs font-bold text-muted-foreground tracking-widest uppercase">{step}</span>
              <h3 className="text-xl font-bold mt-1 mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{desc}</p>
              {i < STEPS.length - 1 && (
                <ArrowRight className="md:hidden size-5 text-muted-foreground mx-auto mt-4" />
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
