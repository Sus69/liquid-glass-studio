---
title: Images and Video Textures
description: High-performance video texture streaming, image loading lifecycles, and GPU pipeline integration.
page_type: guide
status: published
---

# Images and Video Textures

Liquid UI features built-in texture streaming for both static images and 60fps dynamic video. When paired with textured backdrop mode, liquid surfaces refract moving video in real time.

---

## 1. Video Texture Setup

To stream video through liquid surfaces, configure `<LiquidProvider>` with a video backdrop:

```tsx
import React from 'react';
import { LiquidProvider, LiquidCard, LiquidButton } from 'liquid-ui';
import 'liquid-ui/styles.css';

export function VideoBackdropDemo() {
  return (
    <LiquidProvider
      backdropMode="textured"
      background={{
        kind: 'video',
        url: '/assets/ambient-motion.mp4',
      }}
    >
      <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <LiquidCard glass="clear" radius={28} style={{ width: 420 }}>
          <h2 style={{ color: '#fff' }}>Fluid Video Refraction</h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)' }}>
            Notice the edges dynamically bending the moving light streams
            behind this card.
          </p>
          <LiquidButton variant="primary">Explore More</LiquidButton>
        </LiquidCard>
      </div>
    </LiquidProvider>
  );
}
```

---

## 2. GPU Texture Upload Architecture

Under the hood, `LiquidEngine` handles video decoding and GPU texture uploads without blocking the main UI thread:

```
┌────────────────────────────────────────────────────────────────────────┐
│ HTMLVideoElement (muted, playsinline, loop, autoplay)                  │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
                    Gated by video.readyState >= HAVE_CURRENT_DATA
                                   │
        ┌──────────────────────────┴──────────────────────────┐
        │                                                     │
   [WebGL2 Backend]                                    [WebGPU Backend]
  updateVideoTexture()                              gpuUpdateVideoTexture()
        │                                                     │
  gl.bindTexture()                                  createImageBitmap(video)
  gl.texSubImage2D(..., video)                      device.queue.copyExternalImageToTexture()
        │                                                     │
        └──────────────────────────┬──────────────────────────┘
                                   ▼
                    Sampled by Optical Shaders (60 FPS)
```

### WebGL2 Implementation (`engine/backends/webgl/textures.ts:50-75`)
```ts
export function updateVideoTexture(gl: WebGL2RenderingContext, texture: WebGLTexture, video: HTMLVideoElement) {
  if (video.readyState < video.HAVE_CURRENT_DATA) return null;
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, video.videoWidth, video.videoHeight, gl.RGBA, gl.UNSIGNED_BYTE, video);
  return { width: video.videoWidth, height: video.videoHeight };
}
```

### WebGPU Implementation (`engine/backends/webgpu/textures.ts:45-78`)
```ts
export async function gpuUpdateVideoTexture(device: GPUDevice, texture: GPUTexture, video: HTMLVideoElement) {
  if (video.readyState < video.HAVE_CURRENT_DATA) return;
  const bitmap = await createImageBitmap(video);
  device.queue.copyExternalImageToTexture(
    { source: bitmap },
    { texture },
    [video.videoWidth, video.videoHeight]
  );
  bitmap.close();
}
```

---

## 3. Video Performance Considerations

### Render-on-Demand vs. Continuous Video
- When displaying **static images or DOM elements**, Liquid UI's `Scheduler` enters sleep mode whenever elements are at rest, consuming **0% continuous GPU cycles**.
- When streaming **video**, new pixel data arrives on every monitor refresh (`hasVideoData = true`), requiring the scheduler to dispatch GPU fragment evaluations every frame.

### Best Practices for Video Textures:
1. **Resolution Cap**: Use $1080\text{p}$ ($1920\times 1080$) or $720\text{p}$ video. Uploading $4\text{K}$ video frames to GPU textures every $16\text{ms}$ creates significant PCIe memory transfer pressure on integrated GPUs.
2. **Codec Selection**: Encode background videos with modern, lightweight codecs like H.264 or WebM (VP9/AV1) with low CRF to minimize hardware decoding overhead.
3. **Mobile Autoplay Compliance**: Liquid UI automatically equips its internal `<video>` element with `muted`, `playsinline`, `autoPlay`, and `loop`. If hosting video externally, ensure your server sends valid CORS headers (`Access-Control-Allow-Origin: *`).

---

## Next Steps

- Understand pointer physics in **[Interaction and Springs](guides/interaction-springs.md)**.
- Read about GPU fillrate tuning in **[Performance Optimization](guides/performance.md)**.
