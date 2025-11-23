# 3D Development Tools

Reusable tools for systematic 3D model development with Playwright.

## Tools

### 3d-viewer.mjs - Multi-Angle Screenshot System

Captures 7 viewing angles for comprehensive model validation.

**Views captured:**
- Perspective (three-quarter view)
- Front, Back, Left, Right
- Top, Bottom

**Usage:**
```bash
node tools/3d-viewer.mjs
```

**Requirements:**
Main.js must expose globals:
```javascript
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.controls = controls;
```

**Output:**
Screenshots saved to `.temp/view-*.png` (gitignored)

## Iteration Workflow

1. Modify geometry in `main.js`
2. Run `node tools/3d-viewer.mjs`
3. Review all 7 angles in `.temp/`
4. Identify issues (proportions, positioning, colors)
5. Fix and repeat until satisfactory

## Benefits

- Catches issues invisible from single angle
- Validates proportions from all sides
- Enables systematic primitive-based modeling
- Reusable for any Three.js project
