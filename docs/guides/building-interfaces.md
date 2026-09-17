---
title: Building Real Interfaces
description: Best practices and architectural patterns for constructing production applications with Liquid UI.
page_type: guide
status: published
---

# Building Real Interfaces

Building a production user interface with Liquid UI requires more than randomly dropping glass elements onto a page. To achieve a premium, polished aesthetic like our Prism music app demo, you must establish a **coherent material hierarchy**.

```
Interface Hierarchy
├── Backdrop Layer: Photographic wallpaper or video texture
│     ├── Large Containers (<LiquidCard>, <LiquidDiv>, <LiquidModal>):
│     │   - Thick bevels (thickness: 20-24px)
│     │   - Deep squircle corners (radius: 20-28px)
│     │   - Soft ambient drop shadows (shadowExpand: 25-30px, shadow: 0.15)
│     │
│     ├── Interactive Controls (<LiquidButton>, <LiquidInput>, <LiquidToggle>):
│     │   - Proportional bevels (thickness: 10-14px)
│     │   - Responsive press springs (pressDepth: 0.08)
│     │   - Directional glare tracking
│     │
│     └── Status & Metadata (<LiquidPill>):
│         - Delicate bevels (thickness: 8-10px)
│         - Stadium geometry (radius: 999px)
│         - Subtle soft preset ('soft')
```

---

## 1. Establishing Material Proportions

A common beginner mistake is applying a single thick material across every element regardless of size:
- A $20\text{px}$ thickness bevel looks gorgeous on a $400\text{px}\times 300\text{px}$ card.
- However, applying that same $20\text{px}$ thickness to a $36\text{px}$ button causes the edge bevels to collide in the center, turning the button into a distorted glass bead!

### Rule of Thumb for Thickness
- **Containers & Modals**: `thickness: 20 - 28px`
- **Buttons & Form Inputs**: `thickness: 10 - 14px`
- **Pills & Badges**: `thickness: 6 - 8px`

---

## 2. Real-World Dashboard Pattern

Here is a practical, production-ready dashboard layout combining `<LiquidCard>`, `<LiquidButton>`, `<LiquidPill>`, and `<LiquidInput>`:

```tsx
import React, { useState } from 'react';
import {
  LiquidProvider,
  LiquidCard,
  LiquidButton,
  LiquidPill,
  LiquidInput,
} from 'liquid-ui';
import 'liquid-ui/styles.css';

export function DashboardView() {
  const [search, setSearch] = useState('');

  return (
    <LiquidProvider backdropMode="dom">
      <div style={{ maxWidth: 840, margin: '0 auto', padding: '40px 20px' }}>
        {/* Top Filter Bar */}
        <header style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 32 }}>
          <LiquidInput
            placeholder="Filter services…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <LiquidButton variant="primary">Deploy Service</LiquidButton>
        </header>

        {/* Grid of Service Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          <LiquidCard glass="frosted" radius={20} interactive>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <LiquidPill statusColor="#10b981">Healthy</LiquidPill>
              <span style={{ fontSize: 12, opacity: 0.6 }}>us-east-1</span>
            </div>
            <h4 style={{ margin: '0 0 6px' }}>Edge Gateway</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.75 }}>
              Latency: 14ms | Throughput: 42k req/s
            </p>
            <LiquidButton size="sm" variant="secondary">View Metrics</LiquidButton>
          </LiquidCard>

          <LiquidCard glass="frosted" radius={20} interactive>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <LiquidPill statusColor="#f59e0b">High Load</LiquidPill>
              <span style={{ fontSize: 12, opacity: 0.6 }}>eu-west-1</span>
            </div>
            <h4 style={{ margin: '0 0 6px' }}>Compute Cluster</h4>
            <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.75 }}>
              CPU: 88% | Memory: 32/36 GB
            </p>
            <LiquidButton size="sm" variant="secondary">Scale Cluster</LiquidButton>
          </LiquidCard>
        </div>
      </div>
    </LiquidProvider>
  );
}
```

---

## 3. Maintaining Text Legibility

Because glass is naturally translucent, text legibility depends on your background:
1. **Never use pure white text over white glass without blur**: If your card uses a clear preset (`glass="clear"`), white text will vanish when positioned over light background areas.
2. **Use Frosted Glass for Content**: Use `glass="frosted"` for text-heavy panels; its milky white diffusion veil guarantees high contrast across arbitrary backgrounds.
3. **Use Dark Glass for Light Themes**: In light mode, apply `glass="dark"` to create high-contrast smoked glass surfaces.

---

## Next Steps

- Explore custom recipes in **[Creating Custom Glass Effects](guides/custom-effects.md)**.
- Learn how to optimize backgrounds in **[Working with Backgrounds](guides/backgrounds.md)**.
