# Primitive Modeler

A systematic approach to building complex 3D models using simple geometric primitives and multi-view validation.

## Quick Start

### What is this system?

Primitive Modeler is a development methodology and toolset for creating accurate 3D models by:
- Building models from basic shapes (boxes, cylinders, spheres)
- Validating proportions across multiple viewing angles
- Iterating rapidly based on visual comparison with reference images
- Ensuring accuracy without complex modeling software

### Who is it for?

- Developers building 3D web applications with THREE.js
- Technical artists who prefer code-based modeling
- Anyone needing programmatic 3D asset generation
- Teams requiring version-controlled 3D models

### What problems does it solve?

Traditional 3D modeling requires expensive software, non-text file formats, and specialized skills. Primitive Modeler provides:
- Code-based modeling that integrates with version control
- Systematic validation preventing proportion errors
- Rapid iteration without leaving your code editor
- Reproducible models defined entirely in JavaScript

### Getting Started (3 Steps)

1. Set up your THREE.js scene with exposed globals
2. Build your model using primitive geometries
3. Run the multi-view screenshot tool to validate

## Installation

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Node.js 16+ (for screenshot automation)
- THREE.js library

### Browser Requirements

No special browser features required. Works in any browser supporting:
- WebGL 1.0 or higher
- ES6 JavaScript

### No Build Step Needed

The core modeling approach requires only:
- HTML file to host your THREE.js canvas
- JavaScript file defining your model geometry
- Reference images for comparison

For automated multi-view screenshots, install dependencies:

```bash
npm install three playwright
```

### File Structure Overview

```
your-project/
├── index.html              # THREE.js canvas host
├── main.js                 # Your model definition
├── tools/
│   └── 3d-viewer.mjs      # Multi-view screenshot tool
├── .temp/                  # Generated screenshots (gitignored)
│   ├── view-front.png
│   ├── view-back.png
│   └── ...
└── primitive-modeler/
    ├── README.md          # This file
    ├── METHODOLOGY.md     # Detailed process guide
    └── examples/          # Sample models
```

## Usage Workflow

### 1. Prepare Reference Images

Ideal reference set includes 7 orthogonal views:
- Front, Back, Left, Right
- Top, Bottom
- Perspective (three-quarter view)

Fewer views work, but more views catch more issues. Even a single reference image helps.

### 2. Set Up Your THREE.js Scene

Your main JavaScript file must expose these globals:

```javascript
window.scene = scene;
window.camera = camera;
window.renderer = renderer;
window.controls = controls;  // OrbitControls recommended
```

This allows the screenshot tool to programmatically control the camera.

### 3. Build Your Model with Primitives

Define geometry using THREE.js primitives:

```javascript
function createModel() {
  const model = new THREE.Group();

  // Base
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(1, 0.1, 1),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
  );
  base.position.y = 0.05;
  model.add(base);

  // Add more primitives...

  return model;
}
```

### 4. Run Multi-View Screenshot Tool

Generate validation screenshots:

```bash
node tools/3d-viewer.mjs
```

This captures 7 views and saves them to `.temp/view-*.png`.

### 5. Compare Against Reference Images

Open reference and generated screenshots side-by-side. Check:
- Proportions match across all views
- Positions align with reference
- Overall silhouette matches
- Details are in correct locations

### 6. Iterate Based on Visual Comparison

Identify discrepancies, update geometry code, regenerate screenshots. Repeat until satisfied.

### 7. Export Final Renders

When model is accurate, capture high-quality renders or export the model for use in your application.

## File Guide

### METHODOLOGY.md

Detailed explanation of the primitive modeling philosophy:
- Why primitives work for technical modeling
- Core principles (ratios over absolutes, silhouette-first)
- Advanced techniques for complex shapes
- Common pitfalls and solutions

### index.html

Minimal HTML file hosting your THREE.js canvas:
- Canvas element for WebGL rendering
- Script imports for THREE.js and your model
- Basic page structure

### model-generator.js (or main.js)

Your model definition code:
- Scene setup with lighting
- Model geometry using primitives
- Material definitions
- Camera and rendering configuration

### tools/3d-viewer.mjs

Automated screenshot generation:
- Launches dev server
- Controls camera programmatically
- Captures 7 standard views
- Saves to .temp directory

### .temp/

Temporary screenshot output directory:
- Added to .gitignore
- Contains view-*.png files
- Regenerated on each tool run
- Used for comparison against references

### examples/

Sample models demonstrating techniques:
- Simple objects (chair, table)
- Complex assemblies (vehicles, machinery)
- Different material approaches
- Proportion matching examples

## Example Workflow: Building a Chair

### Step 1: Analyze Reference

Examine chair reference images. Identify major components:
- Seat (rectangular box)
- Back (angled rectangle)
- Four legs (cylinders)

### Step 2: Start with Seat

```javascript
const seat = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.05, 0.5),
  new THREE.MeshStandardMaterial({ color: 0x8B4513 })
);
seat.position.y = 0.45;
```

### Step 3: Add Legs

```javascript
function createLeg() {
  return new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.45, 12),
    new THREE.MeshStandardMaterial({ color: 0x654321 })
  );
}

const legFL = createLeg();
legFL.position.set(-0.2, 0.225, 0.2);

// Repeat for other three legs...
```

### Step 4: Add Back

```javascript
const back = new THREE.Mesh(
  new THREE.BoxGeometry(0.5, 0.4, 0.05),
  new THREE.MeshStandardMaterial({ color: 0x8B4513 })
);
back.position.set(0, 0.65, -0.225);
back.rotation.x = -0.1;  // Slight recline
```

### Step 5: Generate Screenshots

```bash
node tools/3d-viewer.mjs
```

### Step 6: Compare and Adjust

Check front view: Legs too thin? Increase cylinder radius.
Check side view: Back angle wrong? Adjust rotation.
Check top view: Leg spacing incorrect? Adjust positions.

### Step 7: Refine

Continue tweaking dimensions and positions until all views match references.

## Tips for Best Results

### Start with Silhouette

Get the overall shape right first. Details come later. If the silhouette is wrong in any view, stop and fix it before adding more geometry.

### Use Ratios, Not Absolute Measurements

Reference images rarely provide exact dimensions. Instead:
- Measure proportions (wheel is 2x seat height)
- Use consistent units within your model
- Adjust entire model scale at the end if needed

### Validate Across All Views

A model can look perfect from one angle and wrong from another. Always check:
- Front and back (symmetry)
- Left and right (symmetry)
- Top and bottom (alignment)
- Perspective (overall proportions)

### One Change at a Time

Resist the urge to tweak everything at once. Change one value, regenerate screenshots, assess impact. This prevents confusion about what caused what.

### Trust the Metrics

Your eyes can deceive you in perspective view. Orthogonal views (front, side, top) show true proportions. If a side view measurement is wrong, fix it even if perspective view looks okay.

### Group Related Geometry

Use THREE.Group to organize components:

```javascript
const wheel = new THREE.Group();
wheel.add(tire);
wheel.add(rim);
wheel.add(hubcap);
// Position the entire wheel as one unit
```

This makes positioning and iteration much easier.

### Comment Your Ratios

When you derive a measurement from another:

```javascript
// Wheel diameter is 0.44, so half is 0.22
wheel.position.y = 0.22;
```

Future you will appreciate understanding the logic.

## Troubleshooting

### Model Not Appearing

**Check console for errors:** Open browser DevTools and look for WebGL or THREE.js errors.

**Verify camera position:** Model might be behind or far from camera.

```javascript
camera.position.set(5, 5, 5);
camera.lookAt(0, 0, 0);
```

**Check object positions:** Ensure objects aren't positioned far from origin.

**Verify lights exist:** Without lights, MeshStandardMaterial appears black.

### Camera Views Incorrect

**Screenshot tool requires globals:** Ensure window.scene, window.camera, etc. are exposed.

**OrbitControls not updating:** Make sure controls.update() runs in animation loop.

**Camera far plane too close:** Increase camera far plane if distant objects disappear.

```javascript
camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
```

### Overlay Alignment Issues

**Different aspect ratios:** Ensure reference and generated images have same dimensions.

**Camera FOV mismatch:** Reference image may have different field of view. Adjust camera FOV to match.

**Perspective vs orthographic:** Some reference images use orthographic projection. Consider using THREE.OrthographicCamera for true orthogonal views.

### Performance Problems

**Too many primitives:** Each primitive is a draw call. Combine static geometry when possible.

**Shadow map size too high:** Reduce shadow map resolution:

```javascript
light.shadow.mapSize.width = 1024;
light.shadow.mapSize.height = 1024;
```

**High polygon count:** Reduce primitive segment counts:

```javascript
// High poly: 64 segments
new THREE.CylinderGeometry(1, 1, 2, 64);

// Low poly: 12 segments (usually sufficient)
new THREE.CylinderGeometry(1, 1, 2, 12);
```

### Export Not Working

**No built-in export:** This system focuses on development, not export. For export:

Install GLTFExporter:

```javascript
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const exporter = new GLTFExporter();
exporter.parse(scene, (gltf) => {
  // Save gltf
}, {});
```

**Model positioning:** Exported models may need repositioning in target application.

## Technical Details

### THREE.js Version

This system works with THREE.js r150 and later. Developed and tested with r160+.

Key dependencies:
- THREE.js core library
- OrbitControls for camera manipulation
- Standard materials (requires lighting)

### Browser Compatibility

**Minimum requirements:**
- WebGL 1.0
- ES6 (arrow functions, let/const, modules)

**Tested browsers:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Known issues:**
- Safari may require WebGL context parameters
- Some mobile browsers limit WebGL contexts

### Performance Limits

**Practical limits for smooth 60fps:**
- 500-1000 primitives in scene
- 2048x2048 shadow maps
- 3-5 shadow-casting lights

**Optimization strategies:**
- Merge static geometry with BufferGeometryUtils
- Use instanced meshes for repeated objects
- Reduce shadow map updates for static objects
- Use simpler materials where shadows aren't needed

### File Formats

**Code format:** Standard JavaScript/ES6 modules

**Image output:** PNG (lossless, supports transparency)

**Model export options:**
- GLTF/GLB (recommended for web)
- OBJ (simple geometry only)
- STL (3D printing)

All exports require additional THREE.js exporters.

## Next Steps

Once comfortable with basic primitive modeling:

1. Read METHODOLOGY.md for deeper philosophical understanding
2. Explore examples/ for more complex model patterns
3. Experiment with advanced primitives (TorusGeometry, LatheGeometry)
4. Integrate into your application's asset pipeline
5. Create custom tools for your specific workflow

## Further Resources

- THREE.js documentation: https://threejs.org/docs
- THREE.js examples: https://threejs.org/examples
- WebGL fundamentals: https://webglfundamentals.org
- 3D math primer: Essential for understanding transformations

## Philosophy

This system embraces constraints:
- Limited primitives force creative solutions
- Code-based models enable version control
- Systematic validation prevents errors
- Simplicity enables rapid iteration

Perfect accuracy is impossible with primitives alone. The goal is "close enough" - models that serve their purpose without requiring professional 3D modeling skills or tools.
