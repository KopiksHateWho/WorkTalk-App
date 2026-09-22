/**
 * Ambient backdrop for the light glassmorphism theme. Purely decorative —
 * hidden from assistive technology and never interactive. Kept to two cool
 * washes plus a slate floor so the room behind the panels stays calm.
 */
export function GlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="animate-float absolute -top-40 -left-32 size-[26rem] rounded-full bg-indigo-300/25 blur-3xl" />
      <div className="animate-float absolute -top-24 -right-24 size-[22rem] rounded-full bg-sky-300/20 blur-3xl [animation-delay:-4s]" />
      <div className="animate-float absolute -bottom-40 left-1/3 size-[30rem] rounded-full bg-slate-400/20 blur-3xl [animation-delay:-8s]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.95),transparent_60%)]" />
    </div>
  );
}
