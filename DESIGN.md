# Design System Strategy: The Celestial Alchemist



## 1. Overview & Creative North Star: "The Celestial Alchemist"

This design system moves away from the sterile, "app-like" interfaces of the past decade toward a **High-End Editorial** experience. Our Creative North Star is **The Celestial Alchemist**: a visual language that feels ancient yet digital, mysterious yet authoritative.



We break the "standard template" look by utilizing **intentional asymmetry** and **tonal depth**. Instead of rigid grids, we treat the screen as a canvas where golden highlights (`primary`) pierce through a deep, mystical void (`surface-dim`). By replacing the previous blue with a deep, spiritual purple (`tertiary`), we evoke a sense of ritual and wisdom. We prioritize breathing room over information density, ensuring every element feels curated and premium.



---



## 2. Colors: Light Through the Void

Our palette is rooted in the contrast between the eternal dark (`#131313`) and the divine glow of gold (`#D4AF37`).



* **Primary (Golden Radiance):** Use `#f2ca50` and `#d4af37` for moments of high importance. These are not just "colors" but signals of value and enlightenment.

* **Secondary (Subtle Earth Tones):** The supporting `#76746a` (a deep, earthy gray-brown) provides a grounding counterpoint to the more vibrant hues. Use this for less prominent UI elements, chips, and secondary actions where a muted but rich presence is desired.

* **Tertiary (Mystical Depth):** The transition to `#d7c6ff` and `#bea5ff` (Roxo Místico) provides a spiritual layer. Use this for interactive secondary elements or background glows that suggest intuition and depth.

* **The "No-Line" Rule:** Under no circumstances are 1px solid borders to be used for sectioning. Boundaries must be defined solely through background color shifts. For example, a `surface-container-low` section sitting on a `surface` background provides all the separation needed.

* **Surface Hierarchy & Nesting:** Treat the UI as stacked sheets of obsidian. An inner card (`surface-container-highest`) should sit inside a section (`surface-container-low`), creating depth without a single structural line.

* **The Glass & Gradient Rule:** For primary CTAs or Hero sections, use a subtle linear gradient from `primary` to `primary-container`. For floating elements (menus/modals), apply **Glassmorphism**: use semi-transparent surface colors with a `backdrop-blur` of 20px to 40px.



---



## 3. Typography: The Sacred & The Modern

We use a high-contrast typographic scale to balance the traditional with the functional.



* **Display & Headlines (Cinzel):** Our serif choice, Cinzel, carries the weight of stone-carved inscriptions. Use `display-lg` (3.5rem) with wide tracking for a cinematic, editorial feel. Headers should never feel "crowded."

* **Body & Labels (Inter):** The "sans-serif" Inter provides the necessary modern clarity. It acts as the functional anchor to the decorative Cinzel.

* **Hierarchy Note:** Use `headline-sm` in all-caps with `0.1em` letter-spacing for sub-headers to reinforce the premium, "boutique hotel" aesthetic.



---



## 4. Elevation & Depth: Tonal Layering

We reject the drop-shadows of 2014. Elevation in this system is achieved through light and atmospheric perspective.



* **The Layering Principle:** Depth is "stacked."

* *Base Layer:* `surface` (#131313).

* *Section Layer:* `surface-container-low`.

* *Component Layer (Cards):* `surface-container-highest`.

* **Ambient Shadows:** If an element must float (like a FAB), use an extra-diffused shadow: `box-shadow: 0 20px 50px rgba(0,0,0,0.6)`. The shadow should feel like a soft glow of darkness, never a harsh edge.

* **The "Ghost Border" Fallback:** If accessibility requires a container edge, use the `outline-variant` token at **15% opacity**. It should be a whisper, not a statement.

* **Glassmorphism:** Navigation bars and floating cards must use `surface-variant` at 60% opacity with a blur effect, allowing the "spiritual purple" of the background to bleed through.



---



## 5. Components: Sculpted Elements



* **Buttons:**

* *Primary:* `rounded-full`, background: `primary-container`, text: `on-primary-container`. Use a subtle inner-glow (top-down) to simulate a physical metallic surface.

* *Secondary:* `rounded-full`, `outline-variant` (ghost border), text: `primary`.

* **Cards:**

* Always `rounded-2xl` (1.5rem to 2rem).

* **Strict Rule:** No dividers. Use `spacing-6` (2rem) of vertical white space to separate the card header from the body content.

* **Input Fields:**

* `surface-container-lowest` backgrounds.

* Focus state: A 1px `ghost border` using the `tertiary` (Purple) color to signal spiritual focus/activation.

* **Selection Chips:**

* `rounded-full`. When selected, use a gradient from `tertiary` to `tertiary-container` to evoke a "glowing" effect.

* **Celestial Dividers (Custom):** Instead of lines, use a 3-dot cluster or a single, highly-faded `primary` gradient line that vanishes into the background at both ends.



---



## 6. Do's and Don'ts



### Do:

* **Use Asymmetry:** Place a `display-lg` headline off-center to create a high-end editorial rhythm.

* **Embrace the Dark:** Allow large areas of `#131313` to remain empty. Negative space is a luxury.

* **Micro-animations:** Use slow, easing transitions (800ms "out-expo") for appearing elements to mimic a meditative breath.



### Don't:

* **Don't use pure white:** Never use `#FFFFFF` for text. Use `on-surface` (#e5e2e1) to maintain a soft, premium look that doesn't strain the eyes.

* **Don't use sharp corners:** Every interactive element must respect the `rounded-2xl` or `rounded-full` rule to maintain the "holistic" and "organic" feel.

* **Don't clutter:** If more than 5 elements are competing for attention, increase the spacing scale or move content to a "nested" surface.