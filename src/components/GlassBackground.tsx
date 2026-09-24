/**
 * Ambient backdrop for the light glassmorphism theme. Purely decorative —
 * hidden from assistive technology and never interactive.
 *
 * The cool washes are painted straight into a single fixed layer instead of
 * three enormous blurred circles that float forever. An animating full-screen
 * `blur()` has to be re-rendered on the GPU every frame, which is what made
 * phones stutter while scrolling; painted gradients in a fixed layer are
 * drawn once and reused. The palette is unchanged.
 */
export function GlassBackground() {
  return (
    <div
      aria-hidden="true"
      className="room-wash pointer-events-none fixed inset-0 -z-10"
    />
  );
}
