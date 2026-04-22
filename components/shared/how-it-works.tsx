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
    <section id="how-it-works" className="px-4 py-24">
      <div className="max-w-5xl mx-auto">
        <div className="mb-16 text-center">
          <span className="section-label mb-5">How it works</span>
          <h2 className="editorial-kicker mx-auto max-w-3xl">
            Three actions. One recurring cycle of competition, generosity, and proof.
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-8 text-muted-foreground">
            The platform is intentionally simple for members and highly structured under the hood: retained scores, monthly draw logic, and a charity destination attached to every active subscription.
          </p>
        </div>

        <div className="relative grid gap-8 md:grid-cols-3">
          <div className="absolute left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] top-10 hidden h-px bg-border md:block" />

          {STEPS.map(({ icon: Icon, step, title, desc, color }, i) => (
            <div key={step} className="relative">
              <div className="paper-panel relative rounded-[2rem] border border-border/70 px-6 py-8 text-center">
                <span className="section-label mb-5">{step}</span>
                <div className={`relative z-10 mx-auto mb-5 flex size-20 items-center justify-center rounded-[1.5rem] ${color} bg-background`}>
                  <Icon className="size-7" />
                </div>
                <h3 className="font-display text-3xl">{title}</h3>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">{desc}</p>
                {i < STEPS.length - 1 && (
                  <ArrowRight className="mx-auto mt-5 size-5 text-muted-foreground md:hidden" />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
