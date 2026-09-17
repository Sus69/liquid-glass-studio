---
title: Material Properties Reference
description: Authoritative reference for all 22 optical, lighting, and geometric properties of LiquidMaterial.
page_type: reference
status: published
---

# Material Properties Reference

Every field in `LiquidMaterial` maps directly to a shader uniform in the GPU rendering pipeline. This reference specifies each property's unit, expected range, default value in the reference `strong` preset, and visual impact.

---

## 1. Optical & Refraction Properties

### `thickness`
- **Type**: `number`
- **Units**: CSS pixels
- **Default**: `20`
- **Known Range**: $> 0$ (typically $8 - 60$)
- **Description**: The physical 3D thickness of the glass edge bevel. Larger values create broad, dramatic lens contours that bend light over a wider margin; smaller values create tight, crisp edges suitable for compact buttons and pills.

### `refraction`
- **Type**: `number`
- **Units**: Index ratio ($1.0 = \text{no refraction}$)
- **Default**: `1.4`
- **Known Range**: $\ge 1.0$ (typically $1.1 - 2.0$)
- **Description**: The optical refractive index according to Snell's Law. Controls how severely incident light rays bend when passing through the glass bevel. Higher values produce dramatic lens magnification and distortion.

### `refractionDistance`
- **Type**: `number`
- **Units**: Normalized ray offset factor
- **Default**: `0.05`
- **Known Range**: $0.0 - 0.2$
- **Description**: The ray displacement multiplier along the calculated surface normal. Interacts with `refraction` to determine the maximum pixel displacement distance of the background texture.

### `dispersion`
- **Type**: `number`
- **Units**: Chromatic aberration scalar
- **Default**: `7`
- **Known Range**: $0 - 50$
- **Description**: Simulates the wavelength-dependent refractive index of real optical glass. Splits red, green, and blue color channels across different refraction angles, producing delicate chromatic fringing along high-contrast borders. Setting to `0` disables chromatic dispersion.

---

## 2. Edge & Fresnel Lighting Properties

### `fresnel`
- **Type**: `number`
- **Units**: Normalized intensity factor
- **Default**: `0.2`
- **Known Range**: $0.0 - 1.0$
- **Description**: The intensity of the grazing-angle Fresnel rim reflection. Highlights the outermost silhouette of the glass surface, separating it visually from the background.

### `fresnelRange`
- **Type**: `number`
- **Units**: Falloff spread factor
- **Default**: `36`
- **Known Range**: $10 - 100$
- **Description**: The width of the Fresnel reflection band. Lower values confine the highlight strictly to the outermost perimeter; higher values spread the rim glow inward across the bevel.

### `fresnelHardness`
- **Type**: `number`
- **Units**: Sharpness exponent
- **Default**: `0.2`
- **Known Range**: $0.0 - 1.0$
- **Description**: The transition sharpness of the Fresnel reflection band. Higher values produce sharp, razor-thin specular rims; lower values produce soft, ambient glows.

---

## 3. Specular Glare Properties

### `glare`
- **Type**: `number`
- **Units**: Normalized intensity factor
- **Default**: `0.9`
- **Known Range**: $0.0 - 1.0$
- **Description**: The maximum intensity of the directional specular reflection band sweeping across the curved squircle bevels.

### `glareRange`
- **Type**: `number`
- **Units**: Spread factor
- **Default**: `30`
- **Known Range**: $10 - 100$
- **Description**: Controls the longitudinal width of the glare highlight band along the glass surface.

### `glareHardness`
- **Type**: `number`
- **Units**: Edge sharpness factor
- **Default**: `0.2`
- **Known Range**: $0.0 - 1.0$
- **Description**: Controls the falloff tightness of the glare highlight. High values simulate polished, reflective crystal; low values simulate matte, satin finishes.

### `glareConvergence`
- **Type**: `number`
- **Units**: Exponent control
- **Default**: `0.5`
- **Known Range**: $0.0 - 1.0$
- **Description**: Controls the specular power curve curvature, shaping how rapidly glare drops off away from the incident light vector.

### `glareOppositeFactor`
- **Type**: `number`
- **Units**: Secondary reflection ratio
- **Default**: `0.8`
- **Known Range**: $0.0 - 1.0$
- **Description**: Glass surfaces exhibit internal secondary reflections on the side opposite the primary light source. This multiplier controls the brightness of the opposite secondary glare band.

### `glareAngle`
- **Type**: `number`
- **Units**: Degrees ($^\circ$)
- **Default**: `-45`
- **Known Range**: $-180^\circ - 180^\circ$
- **Description**: The orientation angle of the virtual light source. A value of `-45` represents light shining from the top-left at $45^\circ$, the classic design convention for natural user interface lighting.

---

## 4. Diffusion & Blur Properties

### `blur`
- **Type**: `number`
- **Units**: Gaussian blur radius in pixels
- **Default**: `1`
- **Known Range**: $0 - 64$
- **Description**: The Gaussian diffusion radius applied to the backdrop layer. Surfaces are automatically grouped by `blurGroupKey` into power-of-two batches ($1, 2, 4, 8, 16, 32, 64$) to share GPU blur passes efficiently.

### `borderBlend`
- **Type**: `boolean`
- **Units**: Boolean flag
- **Default**: `true`
- **Description**: When `true`, blends the blurred backdrop through the full width of the edge bevel. When `false`, the bevel retains sharp, unblurred refractive light.

---

## 5. Color & Tint Properties

### `tint`
- **Type**: `LiquidRGBA` (`{ r: number, g: number, b: number, a: number }`)
- **Units**: $r, g, b \in [0, 255]$, $a \in [0.0, 1.0]$
- **Default**: `{ r: 255, g: 255, b: 255, a: 0 }`
- **Description**: Optical absorption color filter applied to light passing through the glass. Alpha $a=0$ produces completely clear, uncolored glass; higher alpha values produce smoked or colored glass.

```tsx
// Smoked Obsidian Glass Tint:
tint: { r: 12, g: 14, b: 20, a: 0.55 }

// Milky Frosted White Tint:
tint: { r: 255, g: 255, b: 255, a: 0.28 }
```

---

## 6. Depth & Ambient Shadow Properties

### `shadowExpand`
- **Type**: `number`
- **Units**: CSS pixels
- **Default**: `25`
- **Known Range**: $0 - 100$
- **Description**: The spread radius of the ambient drop shadow cast behind the glass surface.

### `shadow`
- **Type**: `number`
- **Units**: Normalized opacity factor
- **Default**: `0.15`
- **Known Range**: $0.0 - 1.0$
- **Description**: The maximum opacity of the ambient drop shadow.

### `shadowOffset`
- **Type**: `{ x: number, y: number }`
- **Units**: CSS pixels
- **Default**: `{ x: 0, y: -10 }`
- **Description**: Directional displacement of the drop shadow relative to the surface center.

---

## 7. Shape & Composition Properties

### `merge`
- **Type**: `number`
- **Units**: Smooth minimum factor
- **Default**: `0.05`
- **Known Range**: $0.0 - 0.5$
- **Description**: The blending radius used by polynomial smooth minimum ($\text{smin}$) when adjacent surfaces merge together (used by `<LiquidBlob>`).

### `radius`
- **Type**: `number`
- **Units**: CSS pixels
- **Default**: `16`
- **Known Range**: $\ge 0$
- **Description**: Corner radius of the shape. Note that component-level `radius` props override this value.

### `roundness`
- **Type**: `number`
- **Units**: Superellipse exponent
- **Default**: `5`
- **Known Range**: $2.0 - 10.0$
- **Description**: Superellipse curvature metric. Value $2.0$ produces standard circular corners; value $5.0$ produces Apple-style squircles with continuous curvature tangents.

---

## Next Steps

- Compare built-in preset configurations in **[Built-in Presets](materials/presets.md)**.
- Learn how to override specific properties in **[Composition & Overrides](materials/composition.md)**.
