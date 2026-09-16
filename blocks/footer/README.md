# Footer Block

## Overview

The Footer block renders the site-wide footer. Its content is authored as a separate document (a fragment) and loaded into every page. In this project the footer contains the brand logo and tagline, a set of link columns (Shop, Markets, Company, Account) authored as a Columns block, and a legal / copyright row.

## Integration

### Block Configuration

The footer content path defaults to `/footer` and can be overridden with the `footer` metadata key on a page. The block itself reads no `readBlockConfig()` keys — it loads and decorates the referenced fragment.

### Block Structure

Authored in the footer fragment (`/footer`):
- A brand section: logo image (white variant for the dark background) + tagline + short description
- A `columns` block holding the link groups (each column = a heading + a list of links)
- A legal row: copyright line and legal links

<!-- ### URL Parameters
No URL parameters affect this block's behavior. -->

<!-- ### Local Storage
No localStorage keys are used by this block. -->

<!-- ### Events
This block does not emit or listen to any custom events. -->

## Behavior Patterns

### Layout Behavior

- **Dark theme**: Petrol-blue (`--color-blue-700`) background with light text; links hover to amber.
- **Link columns**: Laid out by the nested Columns block — stacked on mobile, side by side on wider screens, top-aligned.
- **Logo sizing**: The footer logo is constrained to a fixed height (`44px`, width auto).

### Behavior

- **Fragment loading**: The block loads the footer fragment during the lazy phase and decorates its blocks (including the Columns block) before display.
- **Store view switcher**: Styles are included for the optional commerce store-view switcher when present.

### Error Handling

- **Missing fragment**: If the footer fragment fails to load, the footer renders empty rather than blocking the page.
