---
version: alpha
name: MySK School Light
description: A calm, academic light-mode system with soft blue-pink ambient gradients, restrained borders, and friendly rounded controls.
colors:
  primary: "#216487"
  secondary: "#71787E"
  tertiary: "#C54F7E"
  neutral: "#F6FAFE"
  surface: "#FFFFFF"
  on-surface: "#181C1F"
  border: "#E5E7EB"
  muted: "#F1F5F9"
  accent: "#000000"
  error: "#D92D20"
  success: "#1E8E5A"
  primary-strong: "#18485F"
  primary-soft: "#DCECF4"
  tertiary-soft: "#F8DCE6"
typography:
  headline-display:
    fontFamily: Space Grotesk
    fontSize: 32px
    fontWeight: 400
    lineHeight: 40px
    letterSpacing: 0px
  headline-lg:
    fontFamily: Space Grotesk
    fontSize: 24px
    fontWeight: 400
    lineHeight: 32px
    letterSpacing: 0px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0px
  headline-sm:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: 400
    lineHeight: 22px
    letterSpacing: 0px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 24px
    letterSpacing: 0.25px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0.25px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0.2px
  label-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: 400
    lineHeight: 20px
    letterSpacing: 0px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: 400
    lineHeight: 16px
    letterSpacing: 0px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 400
    lineHeight: 14px
    letterSpacing: 0px
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: 500
    lineHeight: 14px
    letterSpacing: 0.08em
rounded:
  none: 0px
  sm: 4px
  md: 8px
  lg: 16px
  xl: 24px
  full: 9999px
spacing:
  xs: 6px
  sm: 16px
  md: 20px
  lg: 24px
  xl: 130px
  gutter: 24px
  section: 64px
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 42px
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 42px
  button-tertiary:
    backgroundColor: "transparent"
    textColor: "{colors.on-surface}"
    typography: "{typography.label-lg}"
    rounded: "{rounded.full}"
    padding: 0px
  card:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.md}"
    padding: 16px
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: 8px 16px
    height: 42px
  chip:
    backgroundColor: "{colors.muted}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: 6px 12px
  language-toggle-active:
    backgroundColor: "{colors.tertiary-soft}"
    textColor: "{colors.on-surface}"
    rounded: "{rounded.full}"
    padding: 8px 16px
  language-toggle-inactive:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.primary}"
    rounded: "{rounded.full}"
    padding: 8px 16px
---

# MySK School Light

## Overview
MySK School feels approachable, educational, and quietly modern, with a strong sense of clarity over decoration. The layout is spacious and centered, which gives the page a calm, login-first focus suitable for students and staff. Soft ambient color around the edges adds warmth and friendliness without making the experience feel playful or childish.

## Colors
- **Primary (#216487):** A disciplined school-blue used for links, outlines, and secondary actions. It carries most of the brand identity in the interface.
- **Secondary (#71787E):** A neutral gray for subdued UI chrome, borders, and supporting text when lower emphasis is needed.
- **Tertiary (#C54F7E):** A rose accent that appears in the ambient background treatment and selected states, adding a welcoming human tone.
- **Neutral (#F6FAFE):** The light blue-white page base, giving the whole system an airy, clean, paper-like feel.
- **Surface (#FFFFFF):** Pure white used for cards, buttons, and elevated containers to preserve contrast against the tinted canvas.
- **On-surface (#181C1F):** The primary text color; it is near-black but slightly softened for readability and a less stark look than pure black.
- **Border (#E5E7EB):** A delicate cool border for cards and controls, keeping separation subtle rather than heavy.
- **Muted (#F1F5F9):** A very light neutral fill for passive surfaces and inactive states.
- **Primary-strong (#18485F):** A darker blue for stronger emphasis or hover/active treatment when needed.
- **Primary-soft (#DCECF4):** A pale blue tint for selected or informational surfaces.
- **Tertiary-soft (#F8DCE6):** A blush tint for alternate selected states and soft highlight areas.
- **Accent (#000000):** Reserved for crisp iconography or the strongest possible contrast, though the system generally avoids pure black in large areas.
- **Error (#D92D20):** A clear semantic red for validation and destructive states.
- **Success (#1E8E5A):** A restrained green for confirmation and positive feedback.

## Typography
Headlines use Space Grotesk at lighter weights, which gives the interface a distinctive but still academic tone. The main display treatment is 32px/40px, with supporting headings stepping down to 24px and then to Inter for smaller headings, keeping the hierarchy calm and readable. Body text uses Inter with a 14px base size and slightly relaxed letter spacing, while labels and controls stay compact and functional. Uppercase styling is not a dominant pattern; instead, the system relies on weight, size, and spacing for emphasis.

## Layout & Spacing
The page uses a fixed-center composition with a large amount of surrounding whitespace, making the login card feel like the clear focal point. Spacing is rhythmical and conservative: 6px for tight gaps, 16px and 20px for standard control spacing, 24px for grouping, and 130px as the generous outer breathing room. Cards and grouped controls keep internal padding modest, typically 16px, while larger page sections should preserve the airy, uncluttered feel.

## Elevation & Depth
The system is intentionally flat. Instead of heavy shadows, hierarchy comes from contrast, thin borders, and layered tonal distinction between the white surface and the pale blue background. The soft colored glow in the corners acts as ambient depth, but it should remain subtle and never compete with the content card.

## Shapes
The shape language is friendly and rounded, especially for all interactive controls. Cards use an 8px radius for a tidy container feel, while buttons, inputs, and segmented controls use fully pill-shaped corners to reinforce approachability. The overall effect is soft and non-technical, balanced by clean borders and restrained geometry.

## Components
Buttons follow a clear hierarchy. `button-primary` is the strongest action style: dark fill, light text, pill radius, and compact 8px 16px padding with a 42px height. `button-secondary` is outlined and lighter, using a white surface with blue text and the same pill proportions for consistency. `button-tertiary` should remain text-only or transparent, used for quiet support actions. Avoid oversized button chrome; the current system favors compact, horizontally balanced controls.

Cards use the `card` style: white surface, 1px border, 8px radius, and 16px padding. They should feel like framed content rather than elevated panels. Inputs should match the button rhythm with pill shapes and a 42px height, using soft borders and high legibility. Chips and segmented controls should preserve the rounded, compact look; selected language states can use the pink-tinted treatment seen in `language-toggle-active`, while inactive states stay white with blue text. Links and small utility actions are understated, often using the primary blue with minimal decoration.

## Do's and Don'ts
- Do keep the interface spacious and centered, with one primary focal card at a time.
- Do use pill-shaped controls for most actions and toggles.
- Do rely on thin borders and color contrast instead of shadows for depth.
- Do preserve the soft blue-white base and restrained rose accent.
- Don't introduce heavy drop shadows, glassmorphism, or noisy gradients.
- Don't use sharp, angular corners for core interactive elements.
- Don't overuse dark fills; reserve the primary dark treatment for the main action.
- Don't crowd the page with dense navigation or excessive visual hierarchy.
