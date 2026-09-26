# UI_DESIGN_SYSTEM.md

# Premium UI Engineering & Design Rules

You are working on a production-quality application.

Your job is not to make the UI look "fancy."

Your job is to create an interface that is:

* Beautiful
* Clean
* Consistent
* Easy to understand
* Fast to use
* Visually calm
* Responsive
* Accessible
* Maintainable
* Production-ready

The design should feel intentional rather than AI-generated.

---

# 1. Core Design Philosophy

Follow this priority:

> **Hierarchy > Layout > Typography > Spacing > Color > Components > Imagery > Motion > Decoration**

Do not compensate for weak layout with animations, gradients, shadows, or decorative elements.

A beautiful interface should still look good with:

* Animations disabled
* Shadows removed
* Grayscale colors
* Images temporarily unavailable

If the interface only looks good because of effects, the underlying design is weak.

---

# 2. Design Principle: Less, But Better

Do NOT add visual elements simply because they are possible.

Before adding anything, ask:

1. Does this improve usability?
2. Does this communicate meaningful information?
3. Does this improve hierarchy?
4. Does this help the user complete their task?
5. Can an existing component handle this?
6. Does the screen actually need it?

If the answer is no, do not add it.

Avoid:

* Decorative cards
* Excessive badges
* Unnecessary gradients
* Excessive glassmorphism
* Random glow effects
* Floating elements without purpose
* Excessive illustrations
* Multiple competing accent colors
* Too many borders
* Too many shadows
* Card-inside-card-inside-card layouts
* Excessive rounded containers
* Decorative animations
* Unnecessary icons

---

# 3. Visual Hierarchy

Every screen must have a clear hierarchy.

The user should naturally understand:

1. Where am I?
2. What is most important?
3. What can I interact with?
4. What changed?
5. What should I do next?

Use:

* Size
* Weight
* Position
* Contrast
* Spacing
* Grouping

to establish hierarchy.

Do not use color, glow, animation, or decoration as the primary method of hierarchy.

---

# 4. Layout

Use a consistent spacing system.

Preferred spacing scale:

```text
4
8
12
16
20
24
32
40
48
64
80
96
```

Avoid arbitrary values unless there is a strong reason.

Prefer:

```text
p-4
gap-4
mt-6
px-6
```

over constantly inventing:

```text
padding: 17px
margin: 23px
gap: 13px
```

Maintain:

* Strong alignment
* Consistent gutters
* Predictable spacing
* Clear grouping
* Comfortable whitespace

Whitespace is part of the design.

Do not fill empty space just because it exists.

---

# 5. Grid & Responsive Layout

Design mobile and desktop intentionally.

Do not simply shrink the desktop interface.

Desktop may use:

```text
Sidebar
Main content
Secondary panel
```

Mobile may become:

```text
Header
Primary content
Bottom navigation
Optional drawer
```

Prioritize the user's primary task on smaller screens.

Avoid:

* Horizontal overflow
* Tiny text
* Tiny buttons
* Dense desktop layouts squeezed onto mobile
* Important controls hidden unnecessarily

Use responsive breakpoints consistently.

---

# 6. Typography

Typography is one of the primary visual elements.

Use a clear type hierarchy.

Example:

```text
Display
48–64px

Heading 1
32–40px

Heading 2
24–32px

Heading 3
20–24px

Body
14–16px

Secondary
12–14px

Label
11–13px
```

Do not use excessive font weights.

Prefer:

```text
Regular
Medium
Semibold
Bold
```

Avoid making everything bold.

Use muted text for secondary information.

Do not use uppercase text everywhere.

---

# 7. Color System

Use a restrained palette.

Define semantic tokens rather than random colors.

Example:

```text
background
surface
surface-elevated
border
text
text-secondary
text-muted
primary
primary-hover
success
warning
danger
info
```

Prefer one primary accent.

Semantic colors should communicate meaning:

```text
Success → successful state
Warning → attention required
Danger → destructive/error state
Info → informational state
```

Do not use colors simply to make the UI more exciting.

Avoid rainbow dashboards.

Avoid using multiple unrelated accent colors.

---

# 8. Surfaces & Cards

Not everything should be a card.

Use a card only when content represents a meaningful group.

Good:

```text
Market Overview
[related market information]
```

Bad:

```text
Card
  Card
    Card
      Card
```

Avoid excessive:

* Borders
* Shadows
* Background changes
* Rounded containers

A section can exist directly on the page without a card.

Prefer visual grouping through:

* Spacing
* Typography
* Alignment
* Subtle dividers

before adding another container.

---

# 9. Border Radius

Use a consistent radius system.

Example:

```text
sm   → 6px
md   → 10px
lg   → 14px
xl   → 18px
2xl  → 24px
```

Do not randomly mix:

```text
5px
11px
13px
17px
21px
```

Use larger radius values for major surfaces and smaller values for controls.

Do not make every element extremely rounded.

---

# 10. Shadows

Use shadows sparingly.

Shadows should communicate elevation.

Use:

```text
none
subtle
medium
strong
```

Most interfaces should primarily use:

* Surface contrast
* Borders
* Spacing

instead of heavy shadows.

Avoid:

* Neon shadows everywhere
* Large blurry shadows on every card
* Glow around every interactive element

---

# 11. Gradients

Gradients are optional, not mandatory.

Use gradients only when they have a clear visual purpose.

Good uses:

* Hero visual
* Brand accent
* Important visualization
* Background atmosphere

Bad uses:

* Every button
* Every card
* Every heading
* Every icon
* Every section

Do not automatically add gradients because the user asked for "premium."

---

# 12. Glassmorphism

Glassmorphism is NOT the default design language.

Only use it when the visual system explicitly calls for it.

Avoid combining:

```text
glass
+
blur
+
gradient
+
glow
+
heavy shadow
```

on every component.

This quickly creates visual noise.

---

# 13. Icons

Use one consistent icon system.

Icons should have:

* Consistent stroke weight
* Consistent visual size
* Consistent style
* Consistent alignment

Do not mix random icon libraries unless there is a specific reason.

Use icons to communicate meaning.

Do not add an icon to every piece of text.

---

# 14. SVG Rules

Use SVG when it is appropriate.

Good:

* Logos
* Icons
* Simple illustrations
* Diagrams
* Charts
* UI symbols
* Decorative vector artwork with a purpose

Do not create complicated SVGs when:

* CSS can do the job
* A normal image is more appropriate
* The graphic provides no meaningful value

SVG should not become a way to over-engineer simple UI.

---

# 15. Images

Use real images when visual realism adds meaning.

Use images for:

* People
* Products
* Places
* Properties
* Services
* Screenshots
* Photography

Do not replace meaningful photography with unnecessary SVG illustrations.

Images should have:

* Correct aspect ratio
* Proper cropping
* Consistent radius
* Appropriate loading behavior
* Responsive sizing

Do not use images simply to fill empty space.

---

# 16. Animation

Animation must communicate something.

Use animation for:

* State changes
* Navigation
* Loading
* Feedback
* Appearance/disappearance
* Progress
* User interaction
* Data changes

Do NOT animate everything.

Avoid:

* Constant floating
* Infinite decorative movement
* Excessive bouncing
* Excessive scaling
* Long transitions
* Animations that delay interaction

Default timing:

```text
Micro interaction → 100–180ms
Normal transition → 150–250ms
Large transition → 250–400ms
```

Prefer subtle motion.

Animation should feel:

> "responsive"

not:

> "look how much animation I added."

Respect:

```text
prefers-reduced-motion
```

---

# 17. Interaction Feedback

Every important interaction should provide clear feedback.

Examples:

Button:

```text
default
hover
pressed
disabled
loading
success
error
```

Form:

```text
default
focused
invalid
valid
disabled
loading
```

Navigation:

```text
inactive
hover
active
```

Do not rely solely on animation.

Use:

* Color
* Contrast
* Typography
* Icons
* Labels
* Position

where appropriate.

---

# 18. Loading States

Never leave the user wondering whether something is happening.

Use:

* Skeletons
* Spinners
* Progress indicators
* Disabled states
* Status text

But do not overuse skeleton loaders.

If content loads almost instantly, a skeleton may be unnecessary.

---

# 19. Empty States

Empty states should explain:

1. What is empty?
2. Why?
3. What can the user do?

Example:

```text
No saved strategies

You haven't saved any trading strategies yet.

[Create Strategy]
```

Avoid empty screens containing only:

```text
No data
```

---

# 20. Error States

Errors must be understandable.

Do not expose raw technical errors such as:

```text
AxiosError 500
PrismaClientKnownRequestError
ECONNREFUSED
```

Translate technical failures into useful user-facing information.

Example:

```text
We couldn't load your bookings.

Please try again.

[Retry]
```

Technical details can go into logs.

---

# 21. Accessibility

Always consider:

* Keyboard navigation
* Focus states
* Color contrast
* Screen readers
* Touch target size
* Reduced motion
* Semantic HTML
* Labels for inputs
* Meaningful alt text

Do not communicate meaning through color alone.

---

# 22. Component Reuse

Before creating a component:

1. Search the existing component library.
2. Check whether an existing component can be extended.
3. Reuse existing variants.
4. Only create a new component when necessary.

Avoid:

```text
Button
ButtonNew
ButtonPremium
ButtonModern
ButtonDashboard
ButtonSpecial
```

Prefer:

```text
Button
variant="primary"
variant="secondary"
variant="ghost"
variant="danger"
```

The same principle applies to:

* Cards
* Inputs
* Modals
* Dropdowns
* Tabs
* Badges
* Navigation
* Tables

---

# 23. Avoid One-Off CSS

Do not create arbitrary styles for individual screens unless necessary.

Prefer design tokens and reusable utilities.

Bad:

```text
DashboardCardSpecialFinal
```

Good:

```text
Card
variant="elevated"
```

The goal is a system, not a collection of exceptions.

---

# 24. Code Cleanliness

UI quality and code quality are connected.

Do not solve a visual problem by adding layers of unnecessary code.

Before adding code, ask:

> Can the existing architecture support this?

Avoid:

* Duplicate components
* Duplicate styles
* Dead animations
* Unused SVGs
* Unused variants
* Deep conditional rendering
* Giant component files
* Random inline styles
* Magic numbers
* Repeated design values

Extract reusable patterns when they actually repeat.

Do not abstract everything prematurely.

---

# 25. AI Coding Rules

When modifying the UI:

### FIRST

Inspect:

```text
Existing components
Design tokens
Theme
Typography
Spacing
Icon system
Existing animations
Responsive patterns
```

### THEN

Reuse them.

### DO NOT

Invent a new design language for every feature.

Do not introduce:

* New colors without reason
* New radius values without reason
* New shadows without reason
* New animation styles without reason
* New icon libraries without reason
* New component patterns without reason

---

# 26. Before Creating a New UI Component

Ask:

```text
Does this component already exist?
        ↓
Can an existing component be extended?
        ↓
Does this need a new visual pattern?
        ↓
Will this pattern be reused?
        ↓
If yes → create reusable component
If no → keep implementation simple
```

---

# 27. Screen Composition

When designing a screen, start with structure.

Example:

```text
Page
 ├── Header
 ├── Primary information
 ├── Main interaction
 ├── Supporting information
 └── Secondary actions
```

Do NOT start with:

```text
gradient
animation
glass card
SVG
shadow
```

Start with information architecture.

---

# 28. Visual Density

Choose the density appropriate to the product.

Consumer app:

```text
More whitespace
Larger touch targets
Simpler hierarchy
```

Professional dashboard:

```text
Higher information density
Compact controls
Clear grouping
Fast scanning
```

Do not make every application look like a marketing landing page.

---

# 29. Dashboard Rule

For dashboards, prioritize:

```text
1. Current state
2. Important metrics
3. Alerts / changes
4. Primary actions
5. Detailed data
6. Secondary information
```

A dashboard should answer:

> "What do I need to know right now?"

before:

> "What can I click?"

---

# 30. Mobile Rule

Mobile interfaces must prioritize:

```text
One-handed use
Clear hierarchy
Large touch targets
Short interaction paths
Minimal navigation complexity
```

Do not simply stack the desktop UI vertically.

Redesign the information hierarchy when necessary.

---

# 31. Web Rule

Web interfaces can use:

```text
More horizontal space
Persistent navigation
Multi-column layouts
Keyboard interactions
Dense data views
Side panels
Hover states
```

Use the additional space intentionally.

Do not stretch content across the entire viewport without reason.

---

# 32. Responsive Rule

Every component must have a deliberate behavior at:

```text
Mobile
Tablet
Desktop
Large desktop
```

Ask:

> What should disappear?

> What should collapse?

> What should move?

> What should become scrollable?

> What is the primary action?

Do not simply reduce sizes.

---

# 33. Visual QA

After implementing a screen, inspect it visually.

Check:

### Alignment

```text
Are elements aligned?
Are gutters consistent?
Are containers aligned?
```

### Spacing

```text
Are there random gaps?
Are sections breathing?
Is anything cramped?
```

### Typography

```text
Is the hierarchy obvious?
Is secondary text too strong?
Is anything unnecessarily bold?
```

### Color

```text
Are there too many colors?
Is the primary action obvious?
Is contrast sufficient?
```

### Components

```text
Are there too many cards?
Are buttons consistent?
Are icons consistent?
```

### Motion

```text
Does animation communicate something?
Could any animation be removed?
```

### Mobile

```text
Does the layout still make sense?
Can controls be used comfortably?
```

---

# 34. The 80/20 Rule

Spend most design effort on:

```text
Layout
Typography
Spacing
Hierarchy
Consistency
Usability
```

Spend less effort on:

```text
Gradients
Glow
Particles
Decorative SVG
Complex animation
```

A simple interface with excellent fundamentals beats an elaborate interface with weak fundamentals.

---

# 35. Anti-AI Design Rule

The interface must NOT look like a generic AI-generated SaaS template.

Avoid automatically combining:

```text
Dark background
+
purple gradient
+
glass cards
+
neon glow
+
huge rounded corners
+
floating blobs
+
gradient text
+
animated dashboard
```

unless the product's actual brand requires it.

Do not copy the visual language of popular AI/SaaS interfaces by default.

Create a distinct but coherent visual identity.

---

# 36. Final Decision Rule

Before adding any visual element, ask:

> **Does this make the interface clearer, faster, or more meaningful?**

If yes:

Add it intentionally.

If no:

Remove it.

---

# Final Principle

> **Make the interface feel designed, not decorated.**

> **Make the system consistent, not repetitive.**

> **Make animation meaningful, not constant.**

> **Make visuals communicate, not compete.**

> **Make the code reusable, not complicated.**

> **Make every screen understandable before making it beautiful.**
