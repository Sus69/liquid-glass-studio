import { useState, useEffect } from 'react';
import { LiquidPill } from 'liquid-ui';
import {
  IconCpu,
  IconShield,
  IconSparkles,
  IconSliders,
  IconZap,
  IconEye,
  IconRefresh,
} from './Icons';

export function EngineeringSection() {
  const [fps, setFps] = useState<number>(120);
  const [dpr, setDpr] = useState<number>(1);
  const [gpuBackend, setGpuBackend] = useState<'WebGL2' | 'WebGPU'>('WebGL2');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setDpr(Math.min(window.devicePixelRatio || 1, 2));
      if ('gpu' in navigator) {
        setGpuBackend('WebGPU');
      } else {
        setGpuBackend('WebGL2');
      }

      // Simple FPS counter sample
      let frameCount = 0;
      let lastTime = performance.now();
      let raf = 0;

      const calcFps = () => {
        frameCount++;
        const now = performance.now();
        if (now - lastTime >= 1000) {
          setFps(Math.round((frameCount * 1000) / (now - lastTime)));
          frameCount = 0;
          lastTime = now;
        }
        raf = requestAnimationFrame(calcFps);
      };

      raf = requestAnimationFrame(calcFps);
      return () => cancelAnimationFrame(raf);
    }
  }, []);

  const pillars = [
    {
      icon: <IconCpu />,
      title: 'WebGL2 & WebGPU Architecture',
      desc: 'Shared hardware-accelerated multipass rendering pipeline. Computes Snell’s law refraction, Cauchy chromatic dispersion, and LCH specular glare per-pixel.',
    },
    {
      icon: <IconEye />,
      title: '100% Real Accessible DOM',
      desc: 'Content is never drawn onto WebGL textures. Text remains selectable, screen-readable, and crisp. GPU canvas aligns sub-pixel geometry via ResizeObserver.',
    },
    {
      icon: <IconZap />,
      title: 'Second-Order Spring Physics',
      desc: 'Euler spring integration for pointer tracking and SDF press compression. Surfaces physically compress on press rather than applying flat CSS scaling.',
    },
    {
      icon: <IconSparkles />,
      title: 'GPU SDF Implicit Geometry',
      desc: 'Superellipse squireles (p=5.0) and polynomial smooth-minimum (smin) metaball merging computed in raymarched shader fragments.',
    },
    {
      icon: <IconShield />,
      title: 'Full ARIA & A11y Wiring',
      desc: 'Accessible roles (role="switch", role="button", aria-modal, aria-checked, aria-describedby) with keyboard navigation and focus trapping in dialogs.',
    },
    {
      icon: <IconSliders />,
      title: 'Reduced-Motion Support',
      desc: 'Respects the prefers-reduced-motion media query. Automatically suspends spring displacement while preserving optical glass fidelity.',
    },
  ];

  return (
    <section id="engineering" className="section-wrapper">
      <div className="section-header">
        <div className="micro-label">10 // SPECIFICATIONS &amp; ARCHITECTURE</div>
        <h2 className="section-title">Accessibility &amp; Engineering</h2>
        <p className="section-description">
          Engineered as a graphics foundation disguised as a React component system. Built with
          pixel-accurate DOM alignment, Snell&apos;s law optics, and strict accessibility standards.
        </p>
      </div>

      {/* 6 Architecture Pillars */}
      <div className="engineering-pillars-grid">
        {pillars.map((p, idx) => (
          <div key={idx} className="pillar-card">
            <div className="pillar-icon-box">{p.icon}</div>
            <h3 className="pillar-title">{p.title}</h3>
            <p className="pillar-desc">{p.desc}</p>
          </div>
        ))}
      </div>

      {/* Live System Telemetry Monitor */}
      <div className="telemetry-monitor-card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>
              LIVE HARDWARE &amp; ENGINE MONITOR
            </span>
            <LiquidPill statusColor="#34d399" glass="dark">
              ENGINE ACTIVE
            </LiquidPill>
          </div>
          <div style={{ fontSize: 11, color: '#64748b' }}>
            MAX_SHAPES: 48 &bull; MAX_BLUR_RADIUS: 200px
          </div>
        </div>

        <div className="telemetry-stats-row">
          <div className="stat-box">
            <span className="stat-label">GPU BACKEND</span>
            <span className="stat-number" style={{ color: '#38bdf8' }}>
              {gpuBackend}
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">FRAME RATE</span>
            <span className="stat-number" style={{ color: '#34d399' }}>
              {fps} FPS
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">DEVICE PIXEL RATIO</span>
            <span className="stat-number" style={{ color: '#a855f7' }}>
              {dpr.toFixed(1)}x DPR
            </span>
          </div>

          <div className="stat-box">
            <span className="stat-label">SHADER PASSES</span>
            <span className="stat-number" style={{ color: '#f59e0b' }}>
              4 FBO Passes
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
