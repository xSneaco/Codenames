// Quick Reference: Color Schema
// Import this file wherever you need colors

import { colors } from '@/styles/colors';

/*
===========================================
QUICK COLOR REFERENCE
===========================================

📦 BACKGROUNDS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
colors.background.main       → #0a0e14 (Deep charcoal)
colors.background.secondary  → #1a1f29 (Elevated surface)

💬 TEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
colors.text.main            → #e6edf3 (Off-white)
colors.text.secondary       → #8b949e (Muted gray)

✨ ACCENTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
colors.accent.main          → #7c3aed (Vibrant purple)
colors.accent.secondary     → #06b6d4 (Cyan blue)

🚦 STATUS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
colors.status.success       → #10b981 (Emerald green)
colors.status.warning       → #f59e0b (Amber)
colors.status.error         → #ef4444 (Bright red)

===========================================
USAGE EXAMPLES
===========================================

// React Component with Inline Styles
<Box style={{ backgroundColor: colors.background.main }}>
  <Title style={{ color: colors.accent.main }}>Hello</Title>
  <Text style={{ color: colors.text.secondary }}>Subtitle</Text>
</Box>

// Mantine Button with Gradient
<Button
  variant="gradient"
  gradient={{
    from: colors.accent.main,
    to: colors.accent.secondary,
    deg: 90
  }}
>
  Click Me
</Button>

// Status Indicator
<Badge
  style={{
    backgroundColor: colors.status.success,
    color: colors.text.main
  }}
>
  Success!
</Badge>

// Card Component
<Paper
  p="xl"
  style={{
    backgroundColor: colors.background.secondary,
    border: `1px solid ${colors.accent.main}`,
  }}
>
  <Text style={{ color: colors.text.main }}>Card Content</Text>
</Paper>

===========================================
TAILWIND CLASSES (after setup)
===========================================

Backgrounds:
  bg-background-main
  bg-background-secondary

Text:
  text-text-main
  text-text-secondary

Accents:
  bg-accent-main
  bg-accent-secondary
  text-accent-main
  border-accent-main

Status:
  text-status-success
  text-status-warning
  text-status-error
  bg-status-success

===========================================
*/

// Example Component Template
export function ExampleComponent() {
  return (
    <div style={{ backgroundColor: colors.background.main }}>
      <h1 style={{ color: colors.accent.main }}>Title</h1>
      <p style={{ color: colors.text.secondary }}>Description</p>
    </div>
  );
}
