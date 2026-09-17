---
title: Optical Physics & Shader Mathematics
description: Ray-marched refraction, chromatic dispersion, Fresnel reflection, and directional specular glare formulas.
page_type: advanced
status: published
---

# Optical Physics & Shader Mathematics

Liquid UI's fragment shaders evaluate the physical behavior of light interacting with curved, dense optical glass. This page documents the mathematical models executed in the final `mainPass` shader.

---

## 1. Snell's Law & Refractive Ray Deviation

When light enters glass from air, it slows down and refracts toward the surface normal according to Snell's Law:
$$\eta_1 \sin\theta_1 = \eta_2 \sin\theta_2$$

In the fragment shader, ray displacement $\Delta\vec{u}$ across the beveled edge is computed by projecting the surface normal $\vec{N}_{xy}$ along the optical displacement distance:
$$\Delta\vec{u} = \vec{N}_{xy} \cdot \text{u\_refDistance} \cdot (\text{u\_refFactor} - 1.0) \cdot \left(1.0 - \frac{d}{\text{thickness}}\right)$$

Where $d$ is the local edge distance. Rays near the center of the surface ($d \ge \text{thickness}$) suffer zero displacement, ensuring that text situated in the center of a glass card remains undistorted.

---

## 2. Chromatic Dispersion (Spectral Split)

Real optical glass has a refractive index $\eta(\lambda)$ that varies with the wavelength $\lambda$ of light (Cauchy's dispersion equation). Blue light bends slightly more sharply than red light.

Liquid UI models chromatic dispersion by sampling the background texture across three distinct wavelength-offset coordinates:

$$\text{UV}_R = \text{UV} + \Delta\vec{u} \cdot \left(1.0 - \frac{\text{u\_refDispersion}}{100.0}\right)$$
$$\text{UV}_G = \text{UV} + \Delta\vec{u}$$
$$\text{UV}_B = \text{UV} + \Delta\vec{u} \cdot \left(1.0 + \frac{\text{u\_refDispersion}}{100.0}\right)$$

The final refracted color combines the individual channel samples:
$$C_{\text{refracted}} = \big(\text{sample}(T, \text{UV}_R).r, \; \text{sample}(T, \text{UV}_G).g, \; \text{sample}(T, \text{UV}_B).b\big)$$

This creates the delicate rainbow fringing observed along real glass bevels.

---

## 3. Fresnel Grazing-Angle Reflection

At steep grazing angles, glass reflects light like a mirror rather than transmitting it. Liquid UI uses a modified version of **Schlick's approximation**:
$$\text{fresnelFactor} = (1.0 - \vec{N} \cdot \vec{V})^{\text{fresnelHardness}}$$

Where $\vec{V} = (0, 0, 1)$ is the camera view vector. This produces a bright, luminous rim along the perimeter of the shape, accentuating its 3D presence against dark or complex backdrops.

---

## 4. Directional Specular Glare

Specular glare simulates a directional overhead key light. The light vector $\vec{L}$ is defined by the `glareAngle` uniform $\theta$:
$$\vec{L} = \big(\cos\theta, \; \sin\theta, \; 0.5\big)$$

The specular highlight is computed using the half-angle reflection vector:
$$\text{glareDot} = \max\big(0.0, \; \vec{N} \cdot \vec{L}\big)$$
$$\text{glareFactor} = \text{u\_glareFactor} \cdot \big(\text{glareDot}\big)^{1.0 / \text{u\_glareHardness}}$$

### Secondary Opposite Glare
To simulate light bouncing off the back interior surface of the glass, the shader evaluates a secondary reflection on the opposite side ($\vec{L}_{\text{opp}} = -\vec{L}$), scaled by `glareOppositeFactor`.

---

## Next Steps

- Learn how multiple shapes merge in **[Shape Merging Mechanics](advanced/shape-merging.md)**.
- Review engine internals in **[LiquidEngine Internals](advanced/engine.md)**.
