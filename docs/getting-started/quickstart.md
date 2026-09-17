---
title: Quick Start
description: Build your first functional liquid glass interface in under two minutes.
page_type: guide
status: published
---

# Quick Start

Get started by wrapping your interface with `<LiquidProvider>` and rendering your first liquid glass card and interactive button.

---

## Minimal Example

Copy and paste this complete example into your application:

```tsx
import React, { useState } from 'react';
import {
  LiquidProvider,
  LiquidCard,
  LiquidButton,
  LiquidPill,
  LiquidToggle,
} from 'liquid-ui';
import 'liquid-ui/styles.css';

export default function QuickStartApp() {
  const [notifications, setNotifications] = useState(true);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
        padding: 24,
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      {/* 1. Wrap with LiquidProvider to host the shared GPU canvas */}
      <LiquidProvider backdropMode="dom">
        {/* 2. Create a frosted glass card */}
        <LiquidCard
          glass="frosted"
          radius={24}
          interactive
          style={{ width: 340, padding: 28 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
            <LiquidPill glass="soft" statusColor="#10b981">
              Active Project
            </LiquidPill>
            <LiquidToggle
              checked={notifications}
              onCheckedChange={setNotifications}
              aria-label="Toggle alerts"
            />
          </div>

          <h3 style={{ margin: '0 0 8px', color: '#ffffff', fontSize: 20 }}>
            Fluid Workspace
          </h3>
          <p style={{ margin: '0 0 24px', color: '#94a3b8', fontSize: 14, lineHeight: 1.5 }}>
            Real-time optical refraction, specular highlights, and physical spring compression.
          </p>

          <div style={{ display: 'flex', gap: 12 }}>
            <LiquidButton
              variant="primary"
              size="md"
              onClick={() => alert('Clicked!')}
            >
              Confirm
            </LiquidButton>
            <LiquidButton variant="secondary" size="md">
              Settings
            </LiquidButton>
          </div>
        </LiquidCard>
      </LiquidProvider>
    </div>
  );
}
```

---

## What Just Happened?

1. **`<LiquidProvider>` created the GPU canvas**: It probed your browser for WebGPU and WebGL2 capabilities and mounted a single transparent canvas behind your UI.
2. **`<LiquidCard>` registered its bounds**: The card informed the GPU engine of its dimensions and corner radius ($24\text{px}$). Because `interactive` is enabled, moving your pointer over the card dynamically tilts the specular glare highlight.
3. **`<LiquidButton>` activated spring physics**: Hovering over the button triggers a pointer-following displacement, while clicking it visibly compresses the SDF glass geometry.
4. **All text remained standard DOM**: You can select text, inspect elements with browser DevTools, and navigate with a keyboard.

---

## Next Steps

- Learn how to build custom layout primitives in **[Your First Glass Surface](getting-started/first-surface.md)**.
- Read how to customize backdrop modes and background images in **[Using LiquidProvider](getting-started/provider.md)**.
