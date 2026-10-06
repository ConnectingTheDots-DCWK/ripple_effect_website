import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * The primary button with a glint travelling across it.
 *
 * Three things about velora's original were changed rather than kept, and the
 * reasons are the house style rather than taste:
 *
 * - **It is our `Button`, not a bare `<button>`.** Every download on this site
 *   is a link — to `/download`, or straight at a release asset — so it has to
 *   support `asChild`. Building on `Button` also means one focus ring, one
 *   disabled state and one active-press behaviour across the page instead of
 *   two.
 * - **`rounded-lg`, not `rounded-full`.** Both download buttons stand beside an
 *   outline button of the same height, and a pill next to a rounded rectangle
 *   reads as a mistake. The radius scale is `AppRadius` and a pill is not on
 *   it.
 * - **No `hover:scale` and no coloured shadow.** The app translates a button
 *   down a pixel when it is pressed and does nothing else; a button that grows
 *   under the cursor and glows in its own hue is the kind of paint the house
 *   rule is about. The shimmer is the effect — it does not need a second one
 *   underneath.
 *
 * **The class is `glint`, not `shimmer`.** `shadcn/tailwind.css` already owns
 * `shimmer` — as a *text* shimmer that clips the background to the glyphs and
 * makes the label transparent, which on a filled button empties it entirely
 * and reports nothing. The sweep itself is the `glint` utility in
 * `globals.css`, where the sweep is white in both themes and the *alpha* is
 * the token — 0.4 on light mode's indigo, 0.55 on dark mode's paler
 * lavender, so both take the same size step toward white. See the comment
 * there, including why darkening the dark-mode button was tried and undone.
 */
export function ShimmerButton({
  className,
  ...props
}: React.ComponentProps<typeof Button>) {
  return (
    <Button
      className={cn("relative overflow-hidden glint", className)}
      {...props}
    />
  );
}
