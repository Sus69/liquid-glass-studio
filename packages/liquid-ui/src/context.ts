import { createContext, useContext } from 'react';
import type { LiquidEngine } from './engine/LiquidEngine';

export interface LiquidContextValue {
  engine: LiquidEngine | null;
  /** Resolved when the engine backend finished initializing. */
  ready: boolean;
}

export const LiquidContext = createContext<LiquidContextValue>({
  engine: null,
  ready: false,
});

export function useLiquidContext(): LiquidContextValue {
  return useContext(LiquidContext);
}
