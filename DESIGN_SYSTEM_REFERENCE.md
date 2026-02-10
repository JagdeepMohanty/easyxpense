# EasyXpense Design System - Quick Reference

## 🎨 Border Radius System

```css
/* Inputs & Buttons */
border-radius: 8px;

/* Cards & Containers */
border-radius: 12px;

/* Modals & Overlays */
border-radius: 16px;  /* Use .rounded-xl */

/* Alerts & Notifications */
border-radius: 8px;
```

## 🎯 Button Styles

### Primary
```jsx
<Button variant="primary">Add Expense</Button>
```
- Blue gradient background
- White text
- Subtle shadow
- Use for: Main actions

### Secondary
```jsx
<Button variant="secondary">Cancel</Button>
```
- White background
- Gray border
- Gray text
- Use for: Alternative actions

### Danger
```jsx
<Button variant="danger">Delete</Button>
```
- Solid red background
- White text
- Subtle shadow
- Use for: Destructive actions

## ✨ Hover Effects

All interactive elements:
```css
transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;

:hover {
  transform: translateY(-1px);  /* or -2px for cards */
  opacity: 0.95;
  box-shadow: /* enhanced */;
}
```

## 📝 Empty State Template

```jsx
<div className="empty-state">
  <div className="empty-state-icon">🎉</div>
  <div className="empty-state-title">Friendly Title</div>
  <div className="empty-state-description">
    Helpful, conversational description that guides the user.
  </div>
  <Button className="mt-4">Call to Action</Button>
</div>
```

**Guidelines**:
- Icon: Single emoji, 56px size
- Title: Short, friendly (2-4 words)
- Description: Conversational, helpful (1-2 sentences)
- CTA: Optional, only if there's a clear next action

## 🎨 Card Structure

```jsx
<Card>
  <Card.Header>
    <h2>Section Title</h2>
  </Card.Header>
  <Card.Body>
    {/* Content */}
  </Card.Body>
</Card>
```

**Specs**:
- Border radius: 12px
- Border: 1px solid #e5e7eb
- Shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
- Hover: Lift 2px + enhanced shadow

## 🎯 Stat Card

```jsx
<StatCard
  title="Label"
  value="₹1,234"
  icon="💰"
  changeType="positive"
  change="Description"
/>
```

**Features**:
- 3px gradient top border
- 56px icon with gradient background
- Hover: Lift 2px
- Border radius: 12px

## 🎨 Color Palette

### Primary (Blue)
- `#2563eb` - Primary blue
- `#0284c7` - Cyan blue
- `#0369a1` - Dark blue

### Success (Green)
- `#16a34a` - Success green
- `#22c55e` - Light green

### Danger (Red)
- `#dc2626` - Danger red
- `#b91c1c` - Dark red

### Neutral (Gray)
- `#1f2937` - Dark gray (text)
- `#374151` - Medium gray
- `#6b7280` - Light gray (secondary text)
- `#e5e7eb` - Border gray
- `#f9fafb` - Background gray

## 📏 Spacing Scale (4px-based)

```css
gap-2  = 8px   (2 units)
gap-3  = 12px  (3 units)
gap-4  = 16px  (4 units)
gap-6  = 24px  (6 units)
gap-8  = 32px  (8 units)

mb-2   = 8px
mb-4   = 16px
mb-6   = 24px
mb-8   = 32px
mb-12  = 48px
```

## 📝 Typography Scale

```css
H1: 32px / 700 / 1.25 line-height (28px mobile)
H2: 20px / 600 / 1.25 line-height
H3: 16px / 600 / 1.25 line-height
Body: 15px / 400 / 1.6 line-height
Small: 14px / 400 / 1.6 line-height
Tiny: 13px / 400 / 1.6 line-height
```

## ♿ Accessibility

### Focus States
```css
*:focus-visible {
  outline: 2px solid #0284c7;
  outline-offset: 2px;
}
```

### Contrast Ratios
- Body text: 14.5:1 (AAA)
- Secondary text: 4.6:1 (AA)
- Button text: 4.5:1+ (AA)

### Keyboard Navigation
- All interactive elements focusable
- Clear focus indicators
- Skip-to-main-content link

## 🎨 Animation Guidelines

### DO
✅ Use transform and opacity only
✅ Keep durations short (0.2s)
✅ Use ease timing function
✅ Provide visual feedback

### DON'T
❌ Animate layout properties (width, height, margin)
❌ Use long durations (>0.3s)
❌ Create infinite animations (except spinners)
❌ Rely on color alone for feedback

## 📱 Responsive Breakpoints

```css
Mobile:  < 640px
Tablet:  640px - 768px
Desktop: 768px - 1024px
Large:   > 1024px
```

### Mobile Adjustments
- Reduce padding (24px → 16px)
- Single column grids
- Smaller typography (32px → 28px for H1)
- Maintain 44px touch targets

## 🎯 Component Checklist

When creating new components:
- [ ] Uses 8px border radius for inputs/buttons
- [ ] Uses 12px border radius for cards
- [ ] Hover state with transform + opacity
- [ ] Transition duration 0.2s
- [ ] Meets WCAG AA contrast
- [ ] Keyboard accessible
- [ ] Focus-visible indicator
- [ ] Follows 4px spacing system
- [ ] Responsive on mobile

## 💡 Best Practices

### Buttons
- Primary for main action (one per section)
- Secondary for alternatives
- Danger for destructive actions
- Always provide loading states

### Empty States
- Use friendly, conversational copy
- Include helpful emoji icon
- Provide clear next action
- Keep descriptions concise

### Cards
- Group related content
- Use headers for sections
- Maintain consistent padding (24px)
- Add hover states for interactivity

### Forms
- Static labels above inputs
- Clear error messages
- Inline validation
- 16px font size (prevents iOS zoom)

---

**Remember**: Premium feel comes from consistency, subtlety, and attention to detail. Less is more. 🎨✨
