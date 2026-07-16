---
name: GeoKost Design System
colors:
  surface: '#f8f9ff'
  surface-dim: '#cbdbf5'
  surface-bright: '#f8f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#eff4ff'
  surface-container: '#e5eeff'
  surface-container-high: '#dce9ff'
  surface-container-highest: '#d3e4fe'
  on-surface: '#0b1c30'
  on-surface-variant: '#45464d'
  inverse-surface: '#213145'
  inverse-on-surface: '#eaf1ff'
  outline: '#76777d'
  outline-variant: '#c6c6cd'
  surface-tint: '#565e74'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#131b2e'
  on-primary-container: '#7c839b'
  inverse-primary: '#bec6e0'
  secondary: '#006e2f'
  on-secondary: '#ffffff'
  secondary-container: '#6bff8f'
  on-secondary-container: '#007432'
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
  secondary-fixed: '#6bff8f'
  secondary-fixed-dim: '#4ae176'
  on-secondary-fixed: '#002109'
  on-secondary-fixed-variant: '#005321'
  tertiary-fixed: '#e0e3e5'
  tertiary-fixed-dim: '#c4c7c9'
  on-tertiary-fixed: '#191c1e'
  on-tertiary-fixed-variant: '#444749'
  background: '#f8f9ff'
  on-background: '#0b1c30'
  surface-variant: '#d3e4fe'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 48px
    fontWeight: '800'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1.2'
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: '1.2'
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.3'
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.5'
  label-bold:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: '1.4'
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '500'
    lineHeight: '1.4'
    letterSpacing: 0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 4px
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  gutter: 24px
  margin-mobile: 16px
  margin-desktop: 48px
---

## Brand & Style

The design system is engineered for Gen Z students, balancing the precision of geographic data with the approachability of a housing marketplace. The aesthetic is **High-End Tech Minimalism**, prioritizing clarity, rapid scanning, and a sense of "smart" reliability. 

The visual narrative uses generous whitespace to reduce cognitive load during complex property searches. It leans into a contemporary digital aesthetic: clean lines, high-contrast functional elements, and a sophisticated use of depth to make the interface feel responsive and tangible. The goal is to move away from "institutional" real estate software toward a "lifestyle-tech" experience that feels native to a mobile-first generation.

## Colors

The palette is anchored by **Slate Blue**, a deep, authoritative navy that provides high contrast for typography and UI architecture. This is paired with **Vibrant Emerald**, used sparingly as a "pulse" color for calls to action, success states, and map markers, signifying growth and the "green light" to move in.

- **Primary (Deep Blue):** Used for navigation, headings, and primary buttons. It represents the "Geo" (technical/data) aspect.
- **Secondary (Fresh Green):** Used for accents, available status, and highlights. It represents the "Kost" (home/living) aspect.
- **Backgrounds:** A tiered system of cool grays (`#F8FAFC` to `#F1F5F9`) keeps the interface feeling airy and fresh.
- **Status:** Standardized semantic colors for error (Rose 500) and warning (Amber 500) are used, but always with high-contrast text to ensure accessibility for all users.

## Typography

This design system utilizes a dual-font strategy. **Plus Jakarta Sans** is the primary display face; its modern, slightly rounded geometric forms provide a friendly, optimistic tone for headlines and branding. 

**Inter** is used for all functional text, map labels, and body copy. It was chosen for its exceptional legibility at small sizes and its neutral, systematic feel which complements the technical nature of a WebGIS platform. 

Hierarchy is established through weight rather than just size. Important metadata (price, distance to campus) should always use `label-bold` to ensure they pop against the white background.

## Layout & Spacing

The layout follows a **fluid-to-fixed hybrid model**. 
- **Mobile:** A single column layout with 16px side margins. 
- **Tablet/Desktop:** A 12-column grid. On search pages, a "Split-View" is mandatory: the left 40% of the screen is a scrollable list of properties, while the right 60% is a persistent, full-height MapView.

Spacing follows an 8pt grid system to ensure mathematical harmony. Generous internal padding (minimum 24px) within cards and containers is required to maintain the minimalist, premium feel and prevent the UI from feeling "cramped" with data.

## Elevation & Depth

Hierarchy is communicated through **Soft Ambient Shadows** and **Tonal Layering**. 

1.  **Level 0 (Floor):** The main background (off-white/cool gray).
2.  **Level 1 (Cards/Sheets):** White surfaces with a very soft, large-radius shadow (e.g., `0px 10px 25px -5px rgba(15, 23, 42, 0.05)`). This makes property cards appear to float slightly above the map.
3.  **Level 2 (Floating Action/Modals):** Elements like "Filter" buttons or search bars that sit above the map use a more pronounced shadow to indicate they are the highest interactive layer.

Avoid using borders where possible; use subtle shifts in background color or soft shadows to define boundaries instead.

## Shapes

The shape language is defined by **Extra-Large (XL) roundedness**. 
- Standard buttons and input fields use a `12px` (0.75rem) radius.
- Property cards and main containers use a `24px` (1.5rem) radius.
- Search bars and tags (Chips) use a fully rounded "pill" shape.

These oversized radii soften the technical "GIS" aspect of the app, making it feel more like a lifestyle consumer product than a data tool.

## Components

### Buttons
- **Primary:** Solid Deep Blue background with White text. High-contrast and bold.
- **Secondary:** Light Green tint (10% opacity) background with Emerald Green text.
- **Interaction:** On hover, primary buttons should shift slightly in luminosity; on press, they should scale down to 98%.

### Property Cards
Cards must feature a high-aspect-ratio image at the top with `24px` top corner radii. The content area below should use `label-bold` for pricing and `body-md` for the address. A "Save" (heart) icon should float in the top right corner of the image on a blurred glassmorphic circle.

### Input Fields & Search
Search bars should be persistent on the map view, using a white background, pill-shape, and a soft shadow. Input fields use a light gray stroke (`#E2E8F0`) that turns Deep Blue on focus.

### Map Markers
Markers are custom-designed: a small pill showing the price (e.g., "$500") in Deep Blue with White text. When selected, the marker scales up and changes to Emerald Green to provide instant visual feedback.

### Chips & Filters
Small, pill-shaped tags used for amenities (e.g., "WiFi", "AC"). They use a neutral light gray background and `label-sm` typography to keep them secondary to the main content.