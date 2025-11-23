# Autonomous 3D Modeling System

Complete autonomous 3D model generation from reference images using the primitive-modeler framework.

## Overview

This system enables fully automated 3D model creation through a slash command interface. Provide a reference image and object description, and the system handles everything: image analysis, measurement extraction, iterative model building, and validation.

The autonomous agent uses the primitive-modeler methodology to build accurate models from basic geometric shapes, iterating until convergence metrics are satisfied.

## Installation

Run the installation script:

```bash
bash install-autonomous-modeler.sh
```

This will:
- Check prerequisites (curl, ImageMagick, Node.js)
- Create necessary directory structure
- Update .gitignore for temporary files
- Test image processing pipeline
- Verify primitive-modeler framework

### Prerequisites

The following tools must be installed:

- **curl**: For downloading reference images from URLs
- **ImageMagick**: For image processing, splitting model sheets, edge detection
- **Node.js 16+**: For screenshot automation and metrics calculation
- **Modern web browser**: For model visualization

Verify installation:

```bash
curl --version
convert --version  # ImageMagick
node --version
```

## Quick Start

### Basic Usage

Simply provide an object description and reference image:

```bash
/model kart https://example.com/reference-kart.jpg
```

The system will autonomously:
1. Download and analyze the reference image
2. Detect view angles and extract measurements
3. Build the model using THREE.js primitives
4. Capture validation screenshots
5. Calculate IoU metrics
6. Iterate refinements until convergence
7. Report completion with final metrics

### With Local Image

Use a local file path instead of URL:

```bash
/model car /path/to/reference.jpg
```

### Multiple Reference Views

Provide multiple images for better accuracy:

```bash
/model kart front.jpg side.jpg top.jpg
```

The system will use all views during validation, ensuring the model matches from all angles.

### Interactive Mode

Get confirmation prompts after each phase:

```bash
/model kart https://... --interactive
```

The agent will pause after:
- Image processing
- Initial measurements
- Each iteration (every 3 iterations)
- Before final cleanup

This allows inspection and guidance during the autonomous process.

### Continue Previous Session

Resume from the last iteration:

```bash
/model --continue
```

This reloads the previous state and continues iterating. Useful if the process was interrupted or you want to refine an existing model further.

## Command Syntax

### Full Syntax

```bash
/model <object-name> <image-sources> [options]
```

**Parameters:**

- `object-name`: Description of the object (e.g., "kart", "racing car", "office chair")
- `image-sources`: One or more URLs or file paths to reference images
- `options`: Optional flags to control behavior

**Available Options:**

- `--interactive`: Pause for confirmation after each phase
- `--continue`: Resume from previous session
- `--views <view-list>`: Specify view angles (e.g., `--views front,side,top`)
- `--scale <number>`: Provide absolute scale reference in units
- `--from-iteration <N>`: Resume from specific iteration number
- `--max-iterations <N>`: Set maximum iteration limit (default: 15)
- `--iou-threshold <N>`: Set convergence threshold (default: 0.85)

### Examples

**Simple single-view modeling:**
```bash
/model chair https://furniture.com/office-chair.jpg
```

**Multi-view with specific angles:**
```bash
/model car front.jpg --views front
/model car side.jpg --views side
```

**With scale reference:**
```bash
/model kart image.jpg --scale 40
```
(Tells system the kart is 40 units tall in absolute terms)

**Resume and continue refining:**
```bash
/model --continue --max-iterations 20
```

**Interactive mode with custom threshold:**
```bash
/model kart ref.jpg --interactive --iou-threshold 0.90
```

## How It Works

### Phase 1: Image Acquisition and Processing

**Image Download:**
- If URL provided, downloads to `.temp/reference-original.jpg`
- If local path provided, copies to `.temp/`
- Validates image format (JPEG, PNG supported)

**Model Sheet Detection:**
- Analyzes image to determine if it contains multiple views
- Common patterns: side-by-side views, grid layouts, labeled views
- If detected, splits into individual views using ImageMagick

**View Classification:**
- Examines each image to determine viewing angle
- Classification methods:
  - Filename analysis (detects "front", "side", "top", "left", "right", etc.)
  - Aspect ratio analysis (tall = front/back, wide = side, square = top)
  - Edge detection patterns (dominant axes indicate orientation)
- Assigns view labels: front, back, left, right, top, bottom

**Edge Detection:**
- Applies Canny edge detection to extract object boundaries
- Generates binary silhouette masks
- Saves processed images to `.temp/reference-*.jpg`

### Phase 2: Measurement Extraction

**Coordinate System Establishment:**
- Determines object orientation in reference images
- Establishes axis alignment (X = width, Y = height, Z = depth)
- Identifies ground plane and origin point

**Reference Dimension Selection:**
- Finds clearly visible, measurable feature
- Common choices: wheel diameter, overall height, major component width
- Sets as scale reference (e.g., wheel diameter = 1.0 units)

**Ratio-Based Measurements:**
- Measures all features relative to scale reference
- Example: if wheelbase is 5x wheel diameter, records ratio = 5.0
- Builds comprehensive measurement table:
  - Overall dimensions (length, width, height)
  - Component positions (wheels, seat, bodywork)
  - Feature sizes (tube diameters, panel thicknesses)
  - Angles and orientations

**Multi-View Triangulation:**
- Combines measurements from different views
- Front view provides X (width) and Y (height)
- Side view provides Z (depth) and Y (height)
- Top view provides X (width) and Z (depth)
- Resolves 3D positions from 2D views

**Primitive Decomposition Plan:**
- Analyzes object structure to plan primitive usage
- Identifies major volumes (boxes, cylinders, spheres)
- Plans hierarchical build strategy (silhouette → features → details)
- Estimates primitive count budget per phase

### Phase 3: Iterative Model Building

**Initial Model Generation:**
- Edits `primitive-modeler/model-generator.js`
- Implements Phase 1: Silhouette blocking (5-10 large primitives)
- Uses measurements to position and scale primitives
- Creates logical groups for components

**4-Phase Methodology:**

**Phase 1: Silhouette (Iterations 1-3)**
- 5-10 large primitives capturing overall form
- Focus: correct proportions, major mass distribution
- Target: IoU > 0.70 on primary views

**Phase 2: Major Features (Iterations 4-8)**
- Add 20-40 medium primitives
- Focus: distinctive features, structural elements
- Target: IoU > 0.80, all major features recognizable

**Phase 3: Surface Details (Iterations 9-12)**
- Add 50-200+ small primitives
- Focus: panel separations, mechanical details, refinement
- Target: IoU > 0.85, convincing close-up appearance

**Phase 4: Precision Alignment (Iterations 13-15)**
- Micro-adjustments to positions and rotations
- Focus: eliminate gaps, ensure symmetry, perfect alignment
- Target: IoU > 0.85, no visible errors

**Iteration Loop:**

Each iteration follows this sequence:

1. **Edit Model Code**: Update `model-generator.js` with refinements
2. **Render Views**: Launch headless browser, capture 7 views
   - Front (0 degrees)
   - Back (180 degrees)
   - Left (270 degrees)
   - Right (90 degrees)
   - Top (90 degrees elevation)
   - Bottom (-90 degrees elevation)
   - Perspective (45/45 degrees)
3. **Calculate IoU**: Compare rendered silhouettes to reference silhouettes
4. **Analyze Errors**: Identify mismatches by view and priority
5. **Plan Refinements**: Determine next changes (add/adjust/remove primitives)
6. **Update Model**: Apply changes to code
7. **Validate**: Check if convergence criteria met
8. **Repeat or Complete**

**Convergence Detection:**

Stop iterating when:
- IoU > 0.85 on all primary views (front, side, top)
- All major features present (feature checklist complete)
- Edge alignment within 5% tolerance
- No high-priority errors remain
- Diminishing returns (last 3 iterations improved <1% each)

Or when:
- Maximum iterations reached (default: 15)
- Manual termination requested

### Phase 4: Completion and Cleanup

**Final Validation:**
- Generates one final set of screenshots
- Calculates comprehensive metrics
- Creates metrics report JSON

**Metrics Report:**
- Iteration count
- Total primitive count
- Convergence status (true/false)
- IoU scores per view
- Feature completeness percentage
- Time invested
- Known remaining deviations

**Cleanup:**
- Removes temporary processing files
- Keeps final rendered views for reference
- Preserves metrics report
- Updates model file with final code

**Report Summary:**
- Displays completion message
- Shows final IoU scores
- Indicates primitive count
- Provides path to model file
- Suggests next steps (view in browser, manual refinement, export)

## Image Requirements

### Supported Formats

- **JPEG** (.jpg, .jpeg): Most common, lossy compression
- **PNG** (.png): Lossless, supports transparency
- **URLs**: Any direct image link (must be publicly accessible)
- **Local paths**: Absolute or relative file system paths

### Ideal Reference Images

**Single View Images:**

Best results come from:
- **Clear subject isolation**: Minimal background clutter
- **Good lighting**: Even illumination, no harsh shadows
- **Orthogonal angles**: Front, side, or top view (not perspective)
- **High resolution**: 1000px minimum, 2000px+ ideal
- **Minimal distortion**: No fisheye or wide-angle lens effects
- **Sharp focus**: Clear edges and details
- **Contrasting background**: Object distinct from background

**Model Sheet Images:**

Ideal multi-view reference:
- **Multiple orthogonal views in one image**
- **System auto-detects and splits automatically**
- **Common layouts**:
  - Side-by-side: front | side | top
  - Grid: 2x2 or 3x3 layout
  - Labeled views with separators
- **Evenly spaced**: Clear separation between views
- **Consistent scale**: All views at same scale
- **Aligned**: Views share common ground plane or baseline

### View Classification

The system automatically determines view angle using:

**Filename Analysis:**
- Detects keywords: "front", "back", "side", "left", "right", "top", "bottom", "perspective"
- Examples:
  - `kart-front-view.jpg` → front
  - `side_angle.png` → side
  - `top-orthogonal.jpg` → top

**Image Analysis:**
- Aspect ratio patterns (tall images often front/back, wide often side)
- Dominant edge orientations
- Symmetry detection (front/back usually symmetrical)

**Edge Detection:**
- Vertical edge dominance → front or back view
- Horizontal edge dominance → side view
- Radial patterns → top or bottom view

**Manual Override:**
Use `--views` flag to specify explicitly:
```bash
/model kart image.jpg --views front,side
```

### Image Limitations

**Problematic:**
- Heavy perspective distortion (use orthogonal views instead)
- Multiple objects in frame (crop to single object)
- Extreme angles (use front/side/top instead)
- Low resolution (<500px) (upscale or find better reference)
- Motion blur or out of focus (reshoot or find sharper image)
- Inconsistent lighting across views (normalize if possible)

**Solutions:**
- Pre-crop images to isolate subject
- Use photo editing to increase contrast
- Provide multiple views to compensate for single poor view
- Use `--interactive` mode to guide the agent

## Output Files

### Generated Files

**Model Code:**
- `primitive-modeler/model-generator.js`: Your model definition
- JavaScript code using THREE.js primitives
- Fully editable and version-controllable
- Can be manually refined after autonomous generation

**Rendered Views:**
- `.temp/view-front.png`: Front orthogonal view
- `.temp/view-back.png`: Back orthogonal view
- `.temp/view-left.png`: Left orthogonal view
- `.temp/view-right.png`: Right orthogonal view
- `.temp/view-top.png`: Top orthogonal view
- `.temp/view-bottom.png`: Bottom orthogonal view
- `.temp/view-perspective.png`: Three-quarter perspective view

**Reference Images:**
- `.temp/reference-front.jpg`: Processed front reference (if available)
- `.temp/reference-side.jpg`: Processed side reference (if available)
- `.temp/reference-top.jpg`: Processed top reference (if available)
- `.temp/reference-silhouette-*.png`: Binary silhouette masks

**Metrics:**
- `.temp/metrics-report.json`: Detailed convergence metrics
- `.temp/iteration-log.txt`: Change log per iteration

### Viewing Your Model

**Open in browser:**
```bash
cd primitive-modeler/
open index.html  # macOS
xdg-open index.html  # Linux
start index.html  # Windows
```

The viewer shows your model in 7 simultaneous camera views, allowing inspection from all angles.

**Controls:**
- Left mouse: Rotate view
- Right mouse: Pan view
- Scroll wheel: Zoom
- Reset button: Return to default view

### Metrics Report Format

JSON structure:
```json
{
  "object": "kart",
  "iterations": 12,
  "primitives": 47,
  "convergence": true,
  "convergence_iteration": 11,
  "iou_scores": {
    "front": 0.89,
    "back": 0.87,
    "left": 0.91,
    "right": 0.90,
    "top": 0.88,
    "bottom": 0.86,
    "average": 0.885
  },
  "feature_completeness": 0.95,
  "edge_alignment": {
    "silhouette": 0.03,
    "major_features": 0.04,
    "details": 0.08
  },
  "time_invested_minutes": 8,
  "known_deviations": [
    "Small gap between frame tube and mounting bracket (0.02 units)",
    "Seat back angle slightly steep (2 degrees)"
  ]
}
```

**Interpretation:**
- `convergence: true`: Model met all convergence criteria
- `iou_scores.average > 0.85`: Excellent silhouette match
- `feature_completeness > 0.90`: All major features present
- `edge_alignment < 0.05`: Edges within tolerance

## Advanced Usage

### Custom View Assignment

Override automatic view detection:

```bash
/model car front-angle.jpg --views front
```

Treats image as specific view regardless of filename or content.

Multiple assignments:
```bash
/model car image.jpg --views front,side
```

Treats single image as both front and side reference (useful for symmetric objects).

### Measurement Hints

Provide absolute scale reference:

```bash
/model kart image.jpg --scale 40
```

Tells the system the object is 40 units in height (or width, depending on orientation). This anchors all measurements to real-world scale.

### Iteration Control

**Set maximum iterations:**
```bash
/model kart image.jpg --max-iterations 20
```

Allows more refinement attempts (default: 15).

**Resume from specific iteration:**
```bash
/model --continue --from-iteration 8
```

Useful if you want to try a different refinement strategy from a certain point.

**Adjust convergence threshold:**
```bash
/model kart image.jpg --iou-threshold 0.90
```

Requires higher accuracy before stopping (default: 0.85). Note that values above 0.90 are difficult to achieve with primitives.

### Parallel Agent Utilization

The autonomous system spawns 10+ specialized agents in parallel:

- **Image downloaders**: Fetch references simultaneously
- **Image analyzers**: Process different views in parallel
- **Measurement extractors**: Analyze multiple views concurrently
- **Model builders**: Separate agents for different phases
- **Validators**: Calculate metrics across all views simultaneously
- **Refinement planners**: Analyze different error types in parallel

This massive parallelism ensures fast iteration cycles despite the complex workflow.

### Manual Intervention

**Edit during process:**

While running in `--interactive` mode, you can manually edit `primitive-modeler/model-generator.js` between iterations. The system will pick up your changes and continue from there.

**Hybrid workflow:**
1. Let system generate initial model (Phase 1-2)
2. Pause with `--interactive`
3. Manually add complex details
4. Resume with `--continue`
5. System refines your additions

## Troubleshooting

### Image Download Fails

**Symptoms:**
- Error: "Failed to download image from URL"
- Curl timeout or connection refused

**Solutions:**
- Verify URL is publicly accessible (test in browser)
- Check for HTTPS certificate issues
- Ensure curl is installed: `curl --version`
- Try downloading manually: `curl -o test.jpg <URL>`
- Use local file path instead of URL

**Workaround:**
```bash
curl -o /tmp/reference.jpg https://...
/model kart /tmp/reference.jpg
```

### Model Sheet Not Detected

**Symptoms:**
- System treats multi-view image as single view
- Only one view extracted from model sheet

**Solutions:**
- Ensure views are clearly separated (white space or borders)
- Check if views are same size (uneven sizes confuse detector)
- Manually split image and provide separate files
- Use `--views` flag to specify which views are present

**Manual splitting:**
```bash
convert model-sheet.jpg -crop 33%x100% +repage view-%d.jpg
/model kart view-0.jpg view-1.jpg view-2.jpg
```

### Low IoU Scores

**Symptoms:**
- Convergence not achieved after max iterations
- IoU scores plateau below 0.85

**Causes and Solutions:**

**Poor reference quality:**
- Use higher resolution images
- Provide multiple view angles
- Ensure orthogonal views (not perspective)

**Complex geometry:**
- Some shapes are hard to approximate with primitives
- Accept lower threshold: `--iou-threshold 0.80`
- Manually refine after autonomous process

**Measurement errors:**
- Use `--interactive` mode to inspect measurements
- Provide `--scale` hint to anchor dimensions
- Check if views have consistent scale

**Wrong view classification:**
- Manually specify views: `--views front,side,top`
- Rename files to include view keywords

**Refinement strategy:**
```bash
/model kart ref.jpg --interactive --iou-threshold 0.80
# Review after Phase 2, manually adjust if needed
/model --continue --max-iterations 20
```

### ImageMagick Not Found

**Symptoms:**
- Error: "convert: command not found"
- Image processing fails

**Solutions:**

**Linux (Debian/Ubuntu):**
```bash
sudo apt update
sudo apt install imagemagick
```

**Linux (Fedora/RHEL):**
```bash
sudo dnf install imagemagick
```

**macOS:**
```bash
brew install imagemagick
```

**Windows:**
- Download installer from https://imagemagick.org/
- Add to PATH

**Verify installation:**
```bash
convert --version
```

Should output ImageMagick version information.

### Node.js Errors

**Symptoms:**
- Screenshot capture fails
- Metrics calculation errors
- Headless browser issues

**Solutions:**

**Update Node.js:**
```bash
node --version  # Should be 16 or higher
nvm install 16  # If using nvm
```

**Install dependencies:**
```bash
cd primitive-modeler/
npm install three playwright
```

**Playwright issues:**
```bash
npx playwright install chromium
```

### Browser Not Opening

**Symptoms:**
- Model file generated but cannot view in browser
- `index.html` doesn't load model

**Solutions:**

**Check file paths:**
- Ensure `primitive-modeler/index.html` exists
- Verify `model-generator.js` is in same directory

**Browser console:**
- Open browser DevTools (F12)
- Check for JavaScript errors
- Look for missing file errors

**CORS issues:**
- Serve files via local server instead of `file://`
- Use `python -m http.server` or `npx serve`

**Workaround:**
```bash
cd primitive-modeler/
python3 -m http.server 8000
# Open http://localhost:8000 in browser
```

### Iteration Takes Too Long

**Symptoms:**
- Each iteration takes several minutes
- Process seems stuck

**Causes and Solutions:**

**Large images:**
- Resize references before processing
- Reduce to 2000px maximum dimension

**Too many primitives too early:**
- System should add primitives gradually
- If stuck in early phase with 100+ primitives, something is wrong
- Use `--interactive` to inspect and restart

**System resource constraints:**
- Close other applications
- Ensure sufficient RAM (4GB+ recommended)
- Check CPU usage

**Network latency (for URL downloads):**
- Download images locally first
- Use local paths instead of URLs

### Symmetry Errors

**Symptoms:**
- Left and right sides don't match
- Wheels different sizes
- Asymmetric features

**Causes:**
- Reference image has perspective distortion
- View classification error
- Measurement extraction issue

**Solutions:**
- Provide true orthogonal views
- Use `--interactive` to verify measurements before building
- Manually adjust symmetric features after autonomous process

## Integration with Primitive-Modeler

This autonomous system builds on the primitive-modeler framework:

### Framework Components

**model-generator.js:**
- Model definition edited by autonomous agent
- JavaScript code using THREE.js primitives
- Organized into logical groups
- Follows 4-phase methodology

**index.html:**
- 7-view renderer for validation
- Shows model from all angles simultaneously
- Interactive camera controls
- Loads model-generator.js dynamically

**metrics.js:**
- IoU calculation algorithm
- Silhouette extraction
- Edge alignment measurement
- Convergence detection logic

**METHODOLOGY.md:**
- Detailed 4-phase modeling approach
- Primitive selection rules
- Measurement extraction protocol
- Iteration workflow
- Common pitfalls and solutions

### Autonomous Agent Role

The agent acts as an experienced 3D modeler following the methodology:

1. **Analyzes references** like a human modeler examining blueprints
2. **Plans approach** using hierarchical decomposition strategy
3. **Builds iteratively** following silhouette → features → details progression
4. **Validates continuously** using cross-view comparison
5. **Refines systematically** using one-change-at-a-time discipline
6. **Converges efficiently** using IoU metrics and feature checklists

The result is a model that follows best practices as if built by a skilled human modeler, but generated automatically.

### Manual Refinement After Autonomous Process

The autonomous system gets you 85-95% of the way there. For final perfection:

1. **Open model-generator.js** in code editor
2. **Review primitive choices**: Could any be better represented?
3. **Adjust fine details**: Micro-position adjustments
4. **Add finishing touches**: Details too small for autonomous detection
5. **Optimize**: Merge redundant primitives, simplify where possible
6. **Export**: Use THREE.js exporters for GLTF/OBJ if needed

The code is clean, well-organized, and fully editable.

## Team Onboarding

### For New Team Members

Getting started with the autonomous modeling system:

**Step 1: Clone repository**
```bash
git clone <repository-url>
cd kart
```

**Step 2: Run installation**
```bash
bash install-autonomous-modeler.sh
```

**Step 3: Test with simple object**
```bash
/model "test cube"
```

Agent will generate a simple cube for testing (no reference needed).

**Step 4: Try with reference**
Find any reference image online:
```bash
/model chair https://example.com/chair.jpg
```

**Step 5: Explore results**
```bash
cd primitive-modeler/
open index.html
```

**Step 6: Review code**
Open `primitive-modeler/model-generator.js` to see generated code.

### Sharing Models

Models are just JavaScript code:

**Version control friendly:**
- Text-based format (not binary)
- Easy to diff and review in pull requests
- Merge conflicts are rare (different team members work on different objects)

**Collaboration workflow:**
1. Create feature branch: `git checkout -b model/racing-kart`
2. Generate model: `/model kart reference.jpg`
3. Review results, manually refine if needed
4. Commit: `git add primitive-modeler/model-generator.js`
5. Push and create PR
6. Team reviews code and rendered views
7. Merge to main

**Exporting for production:**

If needed for game engine or other application:

```javascript
import { GLTFExporter } from 'three/examples/jsm/exporters/GLTFExporter.js';

const exporter = new GLTFExporter();
exporter.parse(scene, (gltf) => {
  const blob = new Blob([JSON.stringify(gltf)], { type: 'application/json' });
  // Save or upload blob
}, { binary: false });
```

Models can be exported to GLTF, OBJ, STL, or other formats supported by THREE.js exporters.

## Architecture

### Autonomous Agent Orchestration

The `/model` command spawns a coordinated team of specialized agents:

**Image Processing Team (4-6 agents):**
- Download agent: Fetches images from URLs
- Detection agent: Identifies model sheets vs single views
- Splitting agent: Separates multi-view images
- Classification agent: Determines view angles
- Edge detection agent: Extracts silhouettes
- Validation agent: Ensures image quality

**Measurement Team (3-5 agents):**
- Coordinate system agent: Establishes axes and origin
- Dimension agent: Measures ratios and proportions
- Triangulation agent: Combines multi-view measurements
- Validation agent: Cross-checks measurements across views
- Planning agent: Determines primitive decomposition strategy

**Modeling Team (5-7 agents):**
- Code generator agent: Writes model-generator.js
- Silhouette agent: Phase 1 implementation
- Feature agent: Phase 2 implementation
- Detail agent: Phase 3 implementation
- Refinement agent: Phase 4 micro-adjustments
- Group organization agent: Structures primitive hierarchy

**Validation Team (4-5 agents):**
- Screenshot agent: Captures 7 views
- IoU calculation agent: Compares silhouettes
- Feature checklist agent: Verifies completeness
- Edge alignment agent: Measures precision
- Convergence agent: Determines if criteria met

**Orchestration Agent:**
- Coordinates all teams
- Manages iteration loop
- Decides when to stop
- Generates final report
- Handles cleanup

All agents work in parallel where possible, using Claude Code's Task tool for coordination.

### File Structure

```
.claude/
├── commands/
│   └── model.md              # Autonomous modeling command definition
├── install.sh                # Setup script
└── README.md                 # This file

primitive-modeler/            # Core framework
├── index.html                # 7-view renderer
├── model-generator.js        # Model code (edited by agent)
├── metrics.js                # IoU and convergence algorithms
├── README.md                 # Framework documentation
├── METHODOLOGY.md            # Detailed modeling guide
├── examples/                 # Sample models
│   ├── chair/
│   ├── car/
│   └── cube/
└── tools/
    └── 3d-viewer.mjs         # Screenshot automation

.temp/                        # Working files (gitignored)
├── reference-*.jpg           # Processed references
├── view-*.png                # Rendered validation views
├── metrics-report.json       # Convergence metrics
└── iteration-log.txt         # Change history
```

### Data Flow

```
Reference Image(s)
    ↓
[Image Processing]
    ↓
Classified Views + Silhouettes
    ↓
[Measurement Extraction]
    ↓
Dimension Ratios + Primitive Plan
    ↓
[Initial Model Generation] → model-generator.js
    ↓
[Iteration Loop] ←───────────┐
    ↓                         │
[Render 7 Views]             │
    ↓                         │
[Calculate IoU]              │
    ↓                         │
[Analyze Errors]             │
    ↓                         │
[Plan Refinements]           │
    ↓                         │
[Update Model Code]          │
    ↓                         │
[Check Convergence] ─────────┘
    ↓ (if converged)
[Final Report + Cleanup]
    ↓
Finished Model + Metrics
```

## Best Practices

### Starting Simple

**Don't jump to complex objects immediately:**

1. Start with geometric primitives (cube, sphere, cylinder)
2. Move to simple furniture (chair, table)
3. Try mechanical objects (bicycle, simple vehicle)
4. Attempt complex assemblies (racing kart, aircraft)

Each tier teaches you how the system handles different challenges.

### Providing Quality References

**The better your references, the better the results:**

- **Multiple views beat single view**: Provide front, side, and top if possible
- **Orthogonal beats perspective**: Side views should be truly perpendicular
- **High resolution beats low**: 2000px images give more detail to analyze
- **Clean backgrounds beat cluttered**: Solid color backgrounds ideal
- **Consistent lighting beats varied**: Even illumination across all views

**Time invested in finding good references pays off exponentially.**

### Letting It Iterate

**Don't stop the process prematurely:**

- Early iterations look rough (this is expected)
- Convergence typically happens around iteration 8-12
- Phase 1-2 establish proportions (won't look detailed yet)
- Phase 3-4 add refinement (this is where it gets convincing)

**Trust the process.** The methodology is designed to progressively refine.

### Reviewing Results

**After completion, always:**

1. Open `index.html` in browser to see all views
2. Compare rendered views to reference images
3. Check metrics report for convergence data
4. Review `model-generator.js` to understand what was built
5. Test interactivity (rotate, zoom, pan)

**Understanding what the system built helps with manual refinement.**

### Manual Refinement Strategy

**The autonomous system is a starting point:**

- Gets proportions and major features 90%+ accurate
- Details may need hand-tuning
- Primitive choices might be sub-optimal in places
- Your domain knowledge can improve results

**Recommended workflow:**
1. Let system converge autonomously
2. Review and understand generated code
3. Make targeted improvements
4. Keep changes minimal and well-documented
5. Consider feeding improved version back as reference for similar objects

### Code Organization

**Keep model code maintainable:**

- Use descriptive variable names (`frontLeftWheel`, not `wheel1`)
- Group related primitives logically
- Comment complex positioning calculations
- Maintain consistent units and scale
- Follow the grouping hierarchy established by the system

**The autonomous agent generates clean code. Keep it clean when refining.**

## Support Resources

### Documentation

**Framework documentation:**
- `primitive-modeler/README.md`: Framework overview and usage
- `primitive-modeler/METHODOLOGY.md`: Detailed modeling methodology

**Examples:**
- `primitive-modeler/examples/`: Sample models with code

**This file:**
- Installation and setup
- Command syntax and options
- How the system works
- Troubleshooting

### Community

**Questions and issues:**
- Open GitHub issue for bugs or feature requests
- Check existing issues for known problems and solutions
- Contribute improvements via pull request

**Sharing your work:**
- Share your generated models in discussions
- Document interesting use cases
- Contribute reference image sets for common objects

### Further Learning

**THREE.js resources:**
- Official documentation: https://threejs.org/docs
- Examples gallery: https://threejs.org/examples
- Community forums: https://discourse.threejs.org

**3D modeling concepts:**
- Orthogonal projection vs perspective
- Coordinate systems and transformations
- Geometric primitives and CSG
- UV mapping and materials

**Image processing:**
- Edge detection algorithms
- Silhouette extraction
- Image segmentation
- Multi-view geometry

## Future Enhancements

### Planned Features

**Automatic reference finding:**
- Search image databases given object name
- Select best references automatically
- Handle licensing and attribution

**Interactive 3D refinement:**
- Visual editor for adjusting primitives
- Drag-and-drop positioning
- Real-time IoU feedback

**Model libraries:**
- Pre-generated component libraries (wheels, seats, engines)
- Reusable sub-assemblies
- Standard mechanical parts

**Advanced primitives:**
- LatheGeometry for rotational forms
- ExtrudeGeometry for 2D profiles
- CSG operations (union, subtract, intersect)

**Export presets:**
- One-command GLTF export
- Optimized for game engines
- 3D printing preparation (STL with supports)

**Performance optimization:**
- Instance-based primitives for repeated features
- Level-of-detail switching
- Mesh merging for static components

### Contributing

**To contribute to this project:**

1. Fork the repository
2. Create a feature branch
3. Implement your enhancement
4. Add documentation
5. Submit pull request with clear description

**Areas where contributions are welcome:**
- Additional primitive types
- Improved measurement extraction algorithms
- Better model sheet detection
- Example models for different object categories
- UI improvements for the viewer

## License

This autonomous modeling system is part of the kart repository.

See repository LICENSE file for terms and conditions.

## Conclusion

The autonomous 3D modeling system combines image processing, measurement extraction, iterative refinement, and validation metrics to generate accurate primitive-based models automatically. By providing quality reference images and letting the system iterate to convergence, you can produce detailed 3D models without manual modeling in traditional 3D software.

The resulting models are code-based, version-controllable, and fully editable, making them ideal for programmatic workflows and team collaboration.

**Get started:**
```bash
bash install-autonomous-modeler.sh
/model <your-object> <your-reference-image>
```

**Happy modeling.**
