/**
 * WebGPU texture utilities — moved unchanged in behavior from the original
 * Liquid Glass Studio GPUUtils.ts.
 */

export async function gpuLoadTextureFromURL(
  device: GPUDevice,
  url: string,
): Promise<{ texture: GPUTexture; ratio: number }> {
  const img = new Image();
  img.crossOrigin = '';
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error(`Failed to load texture: ${url}`));
    img.src = url;
  });

  const bitmap = await createImageBitmap(img);
  const w = bitmap.width;
  const h = bitmap.height;

  const texture = device.createTexture({
    size: [w, h],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });

  device.queue.copyExternalImageToTexture({ source: bitmap, flipY: false }, { texture }, [w, h]);

  bitmap.close();

  return { texture, ratio: w / h };
}

export function gpuCreateEmptyTexture(device: GPUDevice, width = 1, height = 1): GPUTexture {
  return device.createTexture({
    size: [width, height],
    format: 'rgba8unorm',
    usage:
      GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.COPY_DST | GPUTextureUsage.RENDER_ATTACHMENT,
  });
}

export async function gpuUpdateVideoTexture(
  device: GPUDevice,
  texture: GPUTexture,
  video: HTMLVideoElement,
): Promise<{ ratio: number; texture: GPUTexture } | undefined> {
  if (video.readyState < video.HAVE_CURRENT_DATA) return;

  let ratio = video.videoWidth / video.videoHeight;
  if (isNaN(ratio)) ratio = 1;

  let oldTexture: GPUTexture | null = null;
  if (texture.width !== video.videoWidth || texture.height !== video.videoHeight) {
    oldTexture = texture;
    texture = device.createTexture({
      size: [video.videoWidth, video.videoHeight],
      format: 'rgba8unorm',
      usage:
        GPUTextureUsage.TEXTURE_BINDING |
        GPUTextureUsage.COPY_DST |
        GPUTextureUsage.RENDER_ATTACHMENT,
    });
  }

  const bitmap = await createImageBitmap(video);
  device.queue.copyExternalImageToTexture(
    { source: bitmap, flipY: false },
    { texture },
    [bitmap.width, bitmap.height],
  );
  bitmap.close();

  if (oldTexture) {
    oldTexture.destroy();
  }

  return { ratio, texture };
}
