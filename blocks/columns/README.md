# Columns Block

## Overview

The Columns block arranges content into a set of equal-width columns that stack vertically on small screens and lay out side by side on larger screens. It is used for marketing rows (text + image), value/stat strips, and grouped link lists (e.g. in the footer).

## Integration

### Block Configuration

This block does not read any configuration parameters. Content is authored directly in the block structure.

### Block Structure

The first row's cells define the columns. A `columns-<n>-cols` class is added to the block reflecting the number of columns, and any cell whose only content is a picture is marked `columns-img-col`.

Example authoring structure:
```
| Columns                          |                                   |
|----------------------------------|-----------------------------------|
| ### Heading A\nText for column A | ### Heading B\nText for column B  |
```

<!-- ### URL Parameters
No URL parameters affect this block's behavior. -->

<!-- ### Local Storage
No localStorage keys are used by this block. -->

<!-- ### Events
This block does not emit or listen to any custom events. -->

## Behavior Patterns

### Layout Behavior

- **Mobile-first**: Columns stack vertically (flex column) on small screens.
- **Desktop**: At `min-width: 900px` columns become a flex row with equal `flex: 1` sizing and `min-width: 0` so long content does not overflow the row.
- **Image columns**: Cells containing only a picture are ordered first on mobile and reused as the visual half of a two-column marketing row.
- **Gaps**: Responsive gaps at each breakpoint; images are rounded (`--shape-border-radius-2`).

### Visual Structure

- **Headings**: `h2`–`h4` use the petrol-blue heading color.
- **Consumers**: The footer authors its link groups as a Columns block; a footer-scoped override top-aligns those columns instead of vertically centering them.

### Error Handling

- **Uneven content**: Columns of differing heights lay out without breaking the row.
- **Missing images**: Text-only columns render normally.
