/**
 * WebGPU capability detection — moved from the original Liquid Glass Studio
 * gpuDetect.ts (single-flight promise + cached result).
 */
export interface WebGPUDetectResult {
  supported: boolean;
  reason?: string;
  adapter?: GPUAdapter;
  device?: GPUDevice;
}

let cachedResult: WebGPUDetectResult | null = null;
let detectPromise: Promise<WebGPUDetectResult> | null = null;

export async function detectWebGPU(): Promise<WebGPUDetectResult> {
  if (cachedResult) return cachedResult;
  if (detectPromise) return detectPromise;

  detectPromise = (async () => {
    if (!navigator.gpu) {
      cachedResult = { supported: false, reason: 'WebGPU API not available' };
      return cachedResult;
    }

    try {
      const adapter = await navigator.gpu.requestAdapter();
      if (!adapter) {
        cachedResult = { supported: false, reason: 'No GPU adapter found' };
        return cachedResult;
      }

      const device = await adapter.requestDevice();
      if (!device) {
        cachedResult = { supported: false, reason: 'Failed to get GPU device' };
        return cachedResult;
      }

      cachedResult = { supported: true, adapter, device };
      return cachedResult;
    } catch (e) {
      cachedResult = {
        supported: false,
        reason: e instanceof Error ? e.message : 'Unknown WebGPU error',
      };
      return cachedResult;
    }
  })();

  return detectPromise;
}

export function getWebGPUDetectResult(): WebGPUDetectResult | null {
  return cachedResult;
}
