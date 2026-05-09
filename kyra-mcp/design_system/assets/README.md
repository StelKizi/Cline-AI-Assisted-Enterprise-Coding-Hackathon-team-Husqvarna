# Design System Assets

## Current Logo

✅ **image.webp** - Husqvarna logotype stamp (ACTIVE)

- WebP format with excellent compression
- Transparent background
- **CRITICAL REQUIREMENT**: Must appear in upper-left corner of all landing pages

## Usage

```html
<!-- CORRECT: Logo in upper-left corner -->
<header>
  <img
    src="design_system/assets/image.webp"
    alt="Husqvarna"
    style="height: 48px; width: auto;"
  />
</header>
```

## Critical Rules

1. ✅ Logo **MUST** appear in upper-left corner on landing pages
2. ✅ Never alter, recolor, or reposition the logotype
3. ✅ Never distort proportions (use width: auto OR height: auto, not both)
4. ✅ Load from assets directory (never external CDN)
5. ✅ Logo absence = **CRITICAL FAILURE**

## File Path

Current: `design_system/assets/image.webp`

Referenced in: [components.json](../components.json) → BrandAssets section

---

**Missing Logo = CRITICAL FAILURE**  
Design cannot be approved without proper logotype stamp placement.
