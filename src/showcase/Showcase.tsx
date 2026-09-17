import { useState } from 'react';
import {
  LiquidButton,
  LiquidCard,
  LiquidDiv,
  LiquidDock,
  LiquidDockItem,
  LiquidIconButton,
  LiquidInput,
  LiquidModal,
  LiquidPill,
  LiquidToggle,
  LiquidTooltip,
  LiquidBlob,
  LiquidBlobShape,
} from 'liquid-ui';

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <section style={{ margin: '40px 0' }}>
      <h2 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700 }}>{title}</h2>
      {hint ? <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.6 }}>{hint}</p> : null}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>{children}</div>
    </section>
  );
}

export function Showcase({ textured }: { textured: boolean }) {
  const [enabled, setEnabled] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [query, setQuery] = useState('');

  return (
    <div
      style={{
        maxWidth: 980,
        margin: '0 auto',
        padding: '48px 32px 120px',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        color: '#141820',
      }}
    >
      <header style={{ marginBottom: 32 }}>
        <LiquidPill statusColor="#34c759" glass="soft">
          liquid-ui v0.1
        </LiquidPill>
        <h1 style={{ fontSize: 34, margin: '12px 0 6px', fontWeight: 800 }}>Liquid UI</h1>
        <p style={{ margin: 0, opacity: 0.65, maxWidth: 560 }}>
          Reusable liquid-glass components powered by the shared WebGL2 / WebGPU engine
          {textured ? ' — textured mode (full GPU refraction).' : ' — DOM mode (hybrid compositing).'}{' '}
          Add <code>?bg=photo</code> or <code>?bg=video</code> to the URL for full GPU fidelity.
        </p>
      </header>

      <Section title="Buttons" hint="Spring compression + pointer-following glare. Hover and press.">
        <LiquidButton variant="primary">Get Started</LiquidButton>
        <LiquidButton variant="secondary">Learn More</LiquidButton>
        <LiquidButton variant="ghost">Cancel</LiquidButton>
        <LiquidButton size="sm">Small</LiquidButton>
        <LiquidButton size="lg">Large</LiquidButton>
        <LiquidButton disabled>Disabled</LiquidButton>
        <LiquidButton loading>Loading</LiquidButton>
      </Section>

      <Section title="Cards" hint="Interactive cards respond to pointer movement.">
        <LiquidCard glass="frosted" interactive style={{ width: 280 }}>
          <h3 style={{ margin: '0 0 6px' }}>Project Aurora</h3>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.7 }}>
            A glassmorphic dashboard built with liquid-ui primitives.
          </p>
          <div style={{ marginTop: 14 }}>
            <LiquidButton size="sm" variant="primary">
              Open
            </LiquidButton>
          </div>
        </LiquidCard>
        <LiquidCard glass="dark" style={{ width: 280 }}>
          <h3 style={{ margin: '0 0 6px', color: '#fff' }}>Dark material</h3>
          <p style={{ margin: 0, fontSize: 13, opacity: 0.75, color: '#fff' }}>
            Smoked glass over strong refraction.
          </p>
        </LiquidCard>
      </Section>

      <Section title="Inputs & controls" hint="Real DOM input; spring-driven toggle.">
        <LiquidInput
          placeholder="Search…"
          glass="frosted"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: 240 }}
        />
        <LiquidToggle checked={enabled} onCheckedChange={setEnabled} aria-label="Enable feature" />
        <LiquidPill statusColor={enabled ? '#34c759' : '#ff453a'} glass="soft">
          {enabled ? 'Enabled' : 'Disabled'}
        </LiquidPill>
      </Section>

      <Section title="Tooltips" hint="Focus + hover accessible tooltips.">
        <LiquidTooltip content="Copy to clipboard">
          <LiquidIconButton aria-label="Copy" glass="soft">
            ⧉
          </LiquidIconButton>
        </LiquidTooltip>
        <LiquidTooltip content="Share" side="bottom">
          <LiquidIconButton aria-label="Share" glass="clear">
            ↗
          </LiquidIconButton>
        </LiquidTooltip>
      </Section>

      <Section title="Dock" hint="Pointer-proximity magnification; items share one GPU canvas.">
        <LiquidDock glass="clear" magnification={1.5}>
          <LiquidDockItem aria-label="Home">⌂</LiquidDockItem>
          <LiquidDockItem aria-label="Projects">◇</LiquidDockItem>
          <LiquidDockItem aria-label="Mail">✉</LiquidDockItem>
          <LiquidDockItem aria-label="Music">♪</LiquidDockItem>
          <LiquidDockItem aria-label="Settings">⚙</LiquidDockItem>
        </LiquidDock>
      </Section>

      <Section title="Blobs" hint="The Studio's SDF smooth-merge, as a primitive.">
        <LiquidBlob merge={0.1} style={{ position: 'relative', width: 320, height: 160 }}>
          <LiquidBlobShape x={30} y={30} width={100} height={100} radius={50} />
          <LiquidBlobShape x={110} y={50} width={90} height={90} radius={45} />
          <LiquidBlobShape x={180} y={20} width={110} height={110} radius={55} />
        </LiquidBlob>
      </Section>

      <Section title="Modal" hint="Accessible dialog on a glass panel.">
        <LiquidButton variant="primary" onClick={() => setModalOpen(true)}>
          Open modal
        </LiquidButton>
        <LiquidModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          ariaLabel="Example modal"
          glass="frosted"
        >
          <h3 style={{ marginTop: 0 }}>Glass dialog</h3>
          <p style={{ opacity: 0.75 }}>Press Escape or click the backdrop to close.</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <LiquidButton variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </LiquidButton>
            <LiquidButton variant="primary" onClick={() => setModalOpen(false)}>
              Confirm
            </LiquidButton>
          </div>
        </LiquidModal>
      </Section>

      <Section title="Nested surfaces" hint="Components compose: glass inside glass.">
        <LiquidDiv glass="soft" radius={28} padding={24} style={{ width: 420 }}>
          <h3 style={{ margin: '0 0 10px' }}>Container</h3>
          <p style={{ margin: '0 0 16px', fontSize: 13, opacity: 0.7 }}>
            A LiquidDiv holding nested liquid components — every surface registers with the same
            engine.
          </p>
          <div style={{ display: 'flex', gap: 10 }}>
            <LiquidButton size="sm">Continue</LiquidButton>
            <LiquidPill glass="clear">Nested</LiquidPill>
          </div>
        </LiquidDiv>
      </Section>

      <footer style={{ marginTop: 64, fontSize: 12, opacity: 0.5 }}>
        Rendering engine: Liquid Glass Studio's multipass pipeline, generalized to N shapes.
      </footer>
    </div>
  );
}
