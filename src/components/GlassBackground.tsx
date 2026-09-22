/**
 * Ambient backdrop for the light glassmorphism theme. Purely decorative —
 * hidden from assistive technology and never interactive.
 */
export function GlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="animate-float absolute -top-40 -left-32 size-[26rem] rounded-full bg-sky-400/30 blur-3xl" />
      <div className="animate-float absolute -top-24 -right-24 size-[22rem] rounded-full bg-cyan-300/30 blur-3xl [animation-delay:-4s]" />
      <div className="animate-float absolute -bottom-40 left-1/4 size-[30rem] rounded-full bg-teal-300/25 blur-3xl [animation-delay:-8s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.95),transparent_60%)]" />
    </div>
  );
}
