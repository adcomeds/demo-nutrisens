# Hero Block

## Overview

The Hero block renders a full-bleed hero banner at the top of a page: a background image spanning the full viewport width with a brand gradient overlay, a heading, an optional subheading, and one or two call-to-action buttons. It is presentation-only (no JavaScript decoration) and is styled entirely via CSS.

## Integration

### Block Configuration

This block does not read any configuration parameters. Content is authored directly in the block structure.

### Block Structure

A single row/cell containing, in order:
- A `<picture>`/image — used as the full-bleed background (optional)
- An `<h1>` heading
- An optional subheading paragraph
- CTA buttons, authored as links wrapped in `<strong>` (primary) and/or `<em>` (secondary), each in its own paragraph

Example authoring structure:
```
| Hero                                             |
|--------------------------------------------------|
| ![Alt](image.jpg)                                |
| # Headline                                       |
| Subheadline paragraph.                           |
| **[Primary CTA](/path)**                         |
| _[Secondary CTA](/path)_                          |
```

<!-- ### URL Parameters
No URL parameters affect this block's behavior. -->

<!-- ### Local Storage
No localStorage keys are used by this block. -->

<!-- ### Events
This block does not emit or listen to any custom events. -->

## Behavior Patterns

### Layout Behavior

- **Full-bleed**: The section is edge-to-edge; the image is anchored to `.hero` (with `isolation: isolate` so it layers above the fallback background but below content).
- **Height**: Responsive height via `min-height: clamp(460px, 68vh, 760px)`.
- **Content width**: The text column is centered and capped to the page content width (max-width 1200px) with generous inline padding; line length is limited for readability.
- **Heading**: Fluid size via `clamp()` for impact across breakpoints.

### Visual Structure

- **Image overlay**: A petrol-blue → teal gradient (darkest on the text side) keeps text legible over photography.
- **No-image fallback**: When no image is authored, the hero shows an ice-blue → white gradient background with dark text.
- **Buttons**: `.button.primary` (raspberry fill) and `.button.secondary` (outline; switched to a white outline over an image).

### Error Handling

- **Missing image**: Falls back to the gradient background and dark text automatically (`:has(picture)` toggles the light/dark text treatment).
- **Missing subhead/CTAs**: Rendered gracefully; only the authored elements appear.
