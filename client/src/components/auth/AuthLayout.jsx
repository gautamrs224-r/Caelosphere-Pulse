import Logo from "../ui/Logo.jsx";

export default function AuthLayout({ children, maxWidth = "max-w-md" }) {
  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4 py-12">
      {/* Decorative planets / glow, matching mockup */}
      <div className="pointer-events-none absolute -top-24 -right-24 w-72 h-72 rounded-full bg-gradient-to-br from-purple-700/40 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-24 w-80 h-80 rounded-full bg-gradient-to-tr from-primary/30 to-transparent blur-2xl" />
      <div className="pointer-events-none absolute top-1/3 right-1/4 w-2 h-2 rounded-full bg-white/40" />
      <div className="pointer-events-none absolute top-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-white/30" />
      <div className="pointer-events-none absolute bottom-1/4 right-1/3 w-1 h-1 rounded-full bg-white/40" />

      <div
        className={`relative z-10 w-full ${maxWidth} bg-card/90 glass border border-primary/30 rounded-3xl p-8 sm:p-10 shadow-glow animate-slide-up`}
      >
        <div className="flex justify-center mb-8">
          <Logo size="md" />
        </div>
        {children}
      </div>
    </div>
  );
}
