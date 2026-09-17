/**
 * WebGL2 texture utilities — moved unchanged in behavior from the original
 * Liquid Glass Studio GLUtils.ts.
 */

export function loadTextureFromURL(
  gl: WebGL2RenderingContext,
  url: string,
): Promise<{ texture: WebGLTexture; ratio: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = '';

    image.onload = () => {
      const texture = gl.createTexture();
      if (!texture) return reject(new Error('Failed to create texture'));

      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

      resolve({ texture, ratio: image.naturalWidth / image.naturalHeight });
    };

    image.onerror = () => reject(new Error(`Failed to load texture: ${url}`));
    image.src = url;
  });
}

export function createEmptyTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const texture = gl.createTexture();
  if (!texture) throw new Error('Failed to create texture');

  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  // No image data; updated every frame via updateVideoTexture.

  return texture;
}

export function updateVideoTexture(
  gl: WebGL2RenderingContext,
  texture: WebGLTexture,
  video: HTMLVideoElement,
): { ratio: number } | null {
  if (video.readyState < video.HAVE_CURRENT_DATA) return null;

  let ratio = video.videoWidth / video.videoHeight;
  if (isNaN(ratio)) {
    ratio = 1;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    video.videoWidth,
    video.videoHeight,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    video,
  );
  gl.generateMipmap(gl.TEXTURE_2D);

  return { ratio };
}
