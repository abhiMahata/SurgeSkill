---
name: Nexus Event Intelligence
colors:
  surface: '#fcf8fa'
  surface-dim: '#dcd9db'
  surface-bright: '#fcf8fa'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f5'
  surface-container: '#f0edef'
  surface-container-high: '#eae7e9'
  surface-container-highest: '#e4e2e4'
  on-surface: '#1b1b1d'
  on-surface-variant: '#45464d'
  inverse-surface: '#303032'
  inverse-on-surface: '#f3f0f2'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#505f76'
  on-secondary: '#ffffff'
  secondary-container: '#d0e1fb'
  on-secondary-container: '#54647a'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#191c1e'
  on-tertiary-container: '#818486'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#dae2fd'
  primary-fixed-dim: '#bec6e0'
  on-primary-fixed: '#131b2e'
  on-primary-fixed-variant: '#3f465c'
  secondary-fixed: '#d3e4fe'
  secondary-fixed-dim: '#b7c8e1'
  on-secondary-fixed: '#0b1c30'
  on-secondary-fixed-variant: '#38485d'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#fcf8fa'
  on-background: '#1b1b1d'
  surface-variant: '#e4e2e4'
typography:
  display-lg:
    fontFamily: Hanken Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Hanken Grotesk
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Hanken Grotesk
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Hanken Grotesk
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  headline-lg-mobile:
    fontFamily: Hanken Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  sidebar-width: 280px
  container-max: 1440px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 32px
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 24px
---

## Brand & Style

The design system is engineered for high-stakes event orchestration, prioritizing efficiency, clarity, and executive-level professionalism. The brand personality is **Precise, Empowering, and Forward-Thinking**. It targets event directors and administrative leads who require a "command center" feel that reduces cognitive load while managing complex datasets.

The visual style follows a **Corporate Modern** aesthetic with a heavy emphasis on **Information Density**. It utilizes a structured grid, generous whitespace to prevent data fatigue, and a high-contrast accent system to guide users toward critical path actions. The UI evokes a sense of calm control through its "deep sea" primary tones and crisp "aspen" backgrounds.

## Colors

This design system utilizes a high-fidelity palette designed for long-duration screen usage. 

- **Primary (Midnight Blue):** Used for persistent navigation elements, sidebars, and primary headings to establish authority and depth.
- **Secondary (Slate):** Employed for supportive text, icons, and non-interactive borders.
- **Tertiary (Frost):** A neutral background color used for the main canvas to differentiate the workspace from the sidebar.
- **Accent (Electric Violet):** Reserved exclusively for "hero" actions such as 'Create Event', 'Publish', or 'Register'. This high-energy hue ensures CTA buttons are never lost in a data-heavy environment.
- **Neutrals:** A range of grays from `#F1F5F9` to `#334155` are used for card borders, table dividers, and subtle hover states.

## Typography

The system uses a dual-font strategy to balance character with utility:

- **Hanken Grotesk (Headlines):** Its sharp, modern geometry provides a professional edge to the dashboard's information hierarchy. Use it for page titles, card headers, and large numeric data points.
- **Inter (Body & UI):** Chosen for its exceptional legibility in data tables and small-scale labels. It handles high-density text without becoming muddy.

**Hierarchy Rules:**
- Use `label-md` for table headers and section overlines, always in uppercase with increased letter spacing.
- `display-lg` is reserved for empty state headlines or dashboard hero metrics (e.g., total revenue).
- Ensure a 1.5x line-height for body copy to maintain readability in long event descriptions.

## Layout & Spacing

This design system uses a **Fixed-Fluid Hybrid** grid model.

1.  **Sidebar Navigation:** A fixed 280px sidebar on the left persists across the user and admin portals. On mobile, this collapses into a slide-out drawer.
2.  **Main Content Area:** A fluid canvas with a maximum width of 1440px to ensure line lengths remain readable on ultra-wide monitors.
3.  **The 8px Rhythm:** All spacing (padding, margins, gaps) must be multiples of 8px. 
    - `stack-sm` (8px) for internal element grouping (label to input).
    - `stack-md` (16px) for component grouping.
    - `stack-lg` (24px) for page section breathing room.

**Tables & Cards:**
- Data tables should use "Comfortable" density (12px vertical padding per row).
- Cards in the event gallery should utilize a CSS Grid with `repeat(auto-fill, minmax(300px, 1fr))` to reflow gracefully across device sizes.

## Elevation & Depth

To maintain a professional, systematic look, the design system avoids heavy shadows, instead using **Tonal Layering** and **Subtle Outlines**.

- **Level 0 (Canvas):** The base layer uses `#F8FAFC`.
- **Level 1 (Cards/Tables):** Pure white `#FFFFFF` surfaces with a 1px solid border in `#E2E8F0`. No shadow.
- **Level 2 (Hover/Active):** When a card or list item is interacted with, apply a very soft ambient shadow: `0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05)`.
- **Level 3 (Modals/Dropdowns):** Elevated surfaces that require focus use a more defined shadow to separate from the dashboard and a backdrop blur of 8px on the layer below.

Navigation items in the sidebar use a "Subtract" method: active items are highlighted with a low-opacity version of the accent color or a slight shift in background value.

## Shapes

The shape language is **Soft and Disciplined**. 

- **UI Elements (Inputs, Buttons, Cards):** Use a `0.25rem` (4px) base radius. This creates a crisp, architectural look that feels modern without being overly "bubbly" or consumer-grade.
- **Large Containers:** `rounded-lg` (8px) for main event cards and modal containers.
- **Status Pills:** Use `rounded-xl` (12px) or full pill shapes for status indicators (e.g., "Confirmed", "Draft") to distinguish them from interactive buttons.

## Components

### Buttons
- **Primary Action:** Solid Electric Violet background with white text. High-contrast.
- **Secondary Action:** Ghost style (transparent background) with Midnight Blue border and text.
- **Tertiary:** Text-only with an icon, used for less frequent navigation.

### Cards (Events)
Event cards must feature a 16:9 image ratio at the top, followed by a Hanken Grotesk `headline-sm` title. Meta-data (date, location) should be displayed using `body-sm` with a secondary color icon.

### Data Tables
Tables are the backbone of the management portal.
- **Headers:** Sticky positioning with a light gray background and `label-md` typography.
- **Rows:** Hover state should change background to `#F1F5F9`.
- **Actions:** Use a "More" (vertical ellipsis) menu at the end of each row to keep the UI clean.

### Input Fields
- **Default State:** White background, 1px Slate-200 border.
- **Focus State:** 1px Electric Violet border with a subtle 2px violet outer glow (low opacity).
- **Labels:** Always persistent above the field in `label-md`.

### Sidebar Navigation
The sidebar should be dark (Midnight Blue) with light text. Active links use a left-edge "border-accent" (4px width) and a slightly lighter background tint to indicate the current location.