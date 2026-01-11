import { Building2, Sparkles } from "lucide-react";

export function Header() {
  return (
    <header className="gradient-header px-6 py-10 md:py-12 text-center text-primary-foreground relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/8 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
      </div>
      <div className="relative">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-sm">
            <Building2 className="h-7 w-7 md:h-8 md:w-8" />
          </div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold tracking-tight">
            Deposit Interest Calculator
          </h1>
          <Sparkles className="h-5 w-5 text-amber-300/90" />
        </div>
        <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          Calculate tiered interest rates with monthly breakdown details
        </p>
      </div>
    </header>
  );
}
