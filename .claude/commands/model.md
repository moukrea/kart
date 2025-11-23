---
description: Autonomous 3D model generation from reference images
argument-hint: [object-description] [image-url-or-path] [--interactive] [--continue]
---

# Autonomous 3D Model Generator

You are an autonomous 3D modeling agent using the primitive-modeler system.

## Input Parsing

Arguments received: $ARGUMENTS

Parse the arguments as follows:

1. **Object Description**: First quoted string or first non-flag word(s)
2. **Image URLs/Paths**: Any argument starting with http://, https://, file://, ./, or /
3. **Flags**:
   - `--interactive`: Ask for user confirmation after each phase
   - `--continue`: Resume from previous session state
   - `--max-iterations N`: Maximum iterations (default: 15)
   - `--target-iou N`: Target IoU threshold (default: 0.85)
   - `--debug`: Keep all temporary files for inspection

## System Architecture

This command orchestrates a multi-agent workflow that:

1. Acquires and analyzes reference images
2. Extracts measurements and proportions
3. Iteratively builds a 3D model using primitives
4. Validates against reference images using IoU metrics
5. Refines until convergence or max iterations
6. Cleans up and reports results

## Workflow Phases

### Phase 1: IMAGE ACQUISITION & ANALYSIS

Spawn 4 parallel agents to process reference images:

#### Agent 1: Image Acquisition

**Objective**: Download or copy reference images to working directory

**Tasks**:
- For URLs: Use curl to download to `.temp/reference-original.jpg`
- For local paths: Copy to `.temp/reference-original.jpg`
- Validate image exists and is readable
- Handle multiple images if provided

**Commands**:
```bash
# Download from URL
curl -L -f -o .temp/reference-original.jpg "URL"

# Copy local file
cp "/path/to/image.jpg" .temp/reference-original.jpg

# Validate image
identify .temp/reference-original.jpg
```

**Error Handling**:
- If download fails: Report error and ask user for alternative URL
- If file not found: Report error and ask user to verify path
- If not an image: Report error and request valid image file

#### Agent 2: Image Analysis

**Objective**: Analyze image structure and characteristics

**Tasks**:
- Get image dimensions using ImageMagick `identify`
- Perform edge detection to find rectangular regions
- Determine if image is a model sheet (multiple views) or single view
- Extract color space and bit depth information

**Commands**:
```bash
# Get image properties
identify -format "%w %h %[colorspace] %[bit-depth]" .temp/reference-original.jpg

# Edge detection for region finding
convert .temp/reference-original.jpg -edge 1 -threshold 50% .temp/edges.png

# Find rectangular regions (approximate using connected components)
convert .temp/edges.png -define connected-components:verbose=true \
  -connected-components 8 null: 2>&1 | grep "^ "
```

**Analysis Heuristics**:
- Model sheet indicators: Multiple distinct rectangular regions, blank separators
- Single view indicators: Single connected region, no clear separators
- View count estimation: Number of rectangular regions detected

#### Agent 3: Model Sheet Processor

**Objective**: Split model sheets into individual views (if applicable)

**Tasks**:
- If model sheet detected, identify view boundaries
- Crop each view into separate image files
- Use heuristics to classify each view (front/side/top/back)
- Save as `.temp/reference-{view}.jpg`

**Commands**:
```bash
# Crop specific region
convert .temp/reference-original.jpg -crop WIDTHxHEIGHT+X+Y \
  .temp/reference-front.jpg

# Auto-crop white space around views
convert .temp/reference-original.jpg -trim +repage .temp/trimmed.jpg
```

**Layout Patterns**:
- **Horizontal 3-view**: Left=left, Center=front, Right=right
- **Vertical 3-view**: Top=top, Middle=front, Bottom=bottom
- **Grid 4-view**: TL=front, TR=right, BL=left, BR=top
- **Grid 6-view**: Row1=front/back, Row2=left/right, Row3=top/bottom

#### Agent 4: View Classifier

**Objective**: Determine view type for each reference image

**Tasks**:
- Analyze filename for view keywords (front, side, top, back, left, right)
- Examine image composition and aspect ratio
- Use visual heuristics to classify view
- Create mapping: image_file → view_type

**Classification Heuristics**:

Filename analysis:
- Contains "front" → FRONT
- Contains "back" or "rear" → BACK
- Contains "side" → LEFT or RIGHT (analyze content)
- Contains "left" → LEFT
- Contains "right" → RIGHT
- Contains "top" or "above" → TOP
- Contains "bottom" or "below" → BOTTOM

Visual analysis (if filename inconclusive):
- Square aspect ratio → likely TOP or PERSPECTIVE
- Portrait orientation → likely FRONT or BACK
- Landscape orientation → likely SIDE (LEFT or RIGHT)
- Symmetry detection → front/back (symmetrical) vs side (asymmetrical)

**Output**: JSON mapping of images to views
```json
{
  ".temp/reference-front.jpg": "FRONT",
  ".temp/reference-left.jpg": "LEFT",
  ".temp/reference-top.jpg": "TOP"
}
```

**Coordination**: Wait for all 4 agents to complete before proceeding to Phase 2.

---

### Phase 2: MEASUREMENT EXTRACTION

Spawn 6 parallel agents to extract measurements and plan primitive decomposition:

#### Agent 5: Front View Measurement

**Objective**: Extract measurements from front view reference

**Tasks**:
- Apply edge detection (Sobel or Canny)
- Identify major vertical and horizontal features
- Calculate proportions (width:height ratios)
- Detect symmetry axis
- Identify key features (wheels, windows, body sections, etc.)

**Commands**:
```bash
# Canny edge detection
convert .temp/reference-front.jpg -canny 0x1+10%+30% .temp/edges-front.png

# Sobel edge detection (alternative)
convert .temp/reference-front.jpg -define convolve:scale='!' \
  -morphology Convolve Sobel .temp/sobel-front.png
```

**Measurement Strategy**:
1. Find overall bounding box (width W, height H)
2. Normalize all measurements to W=1.0
3. Measure major features as fractions of W or H
4. Record vertical positions as fractions from bottom
5. Record horizontal positions as fractions from center

**Output Format**:
```json
{
  "view": "FRONT",
  "overall": {"width": 1.0, "height": 0.45},
  "features": {
    "wheels": [
      {"center_x": 0.25, "center_y": 0.12, "diameter": 0.22},
      {"center_x": 0.75, "center_y": 0.12, "diameter": 0.22}
    ],
    "body": {"height": 0.18, "width": 0.85, "bottom": 0.22},
    "seat": {"height": 0.12, "width": 0.30, "bottom": 0.22}
  }
}
```

#### Agent 6: Side View Measurement

**Objective**: Extract measurements from side view reference

**Tasks**:
- Apply edge detection
- Identify major longitudinal features
- Calculate depth:height proportions
- Identify key features along depth axis

**Commands**: Same edge detection as Agent 5

**Measurement Strategy**:
1. Find overall bounding box (depth D, height H)
2. Normalize to D=1.0
3. Measure features along depth axis
4. Record vertical positions relative to ground
5. Identify curves and angles in profile

**Output Format**:
```json
{
  "view": "SIDE",
  "overall": {"depth": 1.0, "height": 0.45},
  "features": {
    "wheel_profile": {"diameter": 0.22, "front_pos": 0.20, "rear_pos": 0.75},
    "body_profile": {"length": 0.70, "height": 0.18, "front": 0.15, "rear": 0.85},
    "seat_profile": {"front": 0.35, "rear": 0.65, "height": 0.34}
  }
}
```

#### Agent 7: Top View Measurement

**Objective**: Extract measurements from top view reference

**Tasks**:
- Apply edge detection
- Identify width and depth dimensions
- Detect symmetry about longitudinal axis
- Map key features in plan view

**Measurement Strategy**:
1. Find overall bounding box (depth D, width W)
2. Normalize to D=1.0
3. Measure width variations along depth
4. Record lateral positions relative to centerline

**Output Format**:
```json
{
  "view": "TOP",
  "overall": {"depth": 1.0, "width": 0.65},
  "features": {
    "body_width_profile": [
      {"pos": 0.15, "width": 0.45},
      {"pos": 0.50, "width": 0.55},
      {"pos": 0.85, "width": 0.50}
    ],
    "wheel_positions": [
      {"depth": 0.20, "width_left": 0.10, "width_right": 0.10},
      {"depth": 0.75, "width_left": 0.10, "width_right": 0.10}
    ]
  }
}
```

#### Agent 8: Proportion Unification

**Objective**: Combine measurements from all views into unified model

**Tasks**:
- Merge measurements from Agents 5, 6, 7
- Resolve conflicts (different views may give different ratios)
- Establish canonical dimensions
- Create 3D feature map

**Conflict Resolution**:
- If measurements disagree, prefer:
  1. Front view for width and height
  2. Side view for depth and height
  3. Top view for width and depth
- Average conflicting measurements with weighted preference
- Flag significant discrepancies for user review

**Output Format**:
```json
{
  "canonical_dimensions": {"width": 1.0, "height": 0.45, "depth": 0.85},
  "features_3d": {
    "wheel_front_left": {"x": -0.25, "y": 0.12, "z": 0.20, "diameter": 0.22, "thickness": 0.12},
    "wheel_front_right": {"x": 0.25, "y": 0.12, "z": 0.20, "diameter": 0.22, "thickness": 0.12},
    "body_main": {"x": 0, "y": 0.31, "z": 0.50, "width": 0.85, "height": 0.18, "depth": 0.70}
  }
}
```

#### Agent 9: Primitive Decomposition Planner

**Objective**: Plan primitive hierarchy based on object type and measurements

**Tasks**:
- Analyze object category (vehicle, furniture, character, etc.)
- Choose appropriate primitives for each feature
- Plan 4-phase decomposition following METHODOLOGY.md
- Estimate primitive count and complexity

**Primitive Selection Criteria**:

**Cylinders**: wheels, tubes, pipes, circular cross-sections
**Boxes**: body panels, rectangular frames, flat surfaces
**Spheres**: rounded caps, joints, ball-shaped features
**Cones**: tapered elements, pointy features
**Torus**: ring shapes, rounded corners

**Phase Planning** (from METHODOLOGY.md):
- **Phase 1**: Overall shape (1-3 large primitives)
- **Phase 2**: Major features (5-10 medium primitives)
- **Phase 3**: Secondary details (10-20 smaller primitives)
- **Phase 4**: Fine details (20-40 small primitives)

**Output Format**:
```json
{
  "object_category": "go-kart",
  "total_estimated_primitives": 45,
  "phases": {
    "phase1": [
      {"primitive": "box", "feature": "main_body", "priority": 1},
      {"primitive": "cylinder", "feature": "front_wheels", "priority": 2}
    ],
    "phase2": [
      {"primitive": "cylinder", "feature": "steering_column", "priority": 3},
      {"primitive": "box", "feature": "seat_base", "priority": 4}
    ],
    "phase3": [...],
    "phase4": [...]
  }
}
```

#### Agent 10: Methodology Consultant

**Objective**: Extract relevant guidance from METHODOLOGY.md

**Tasks**:
- Read `/home/emeric/code/kart/primitive-modeler/METHODOLOGY.md`
- Extract sections relevant to current object type
- Provide phase-specific recommendations
- Identify common pitfalls and solutions

**Key Extractions**:
- Recommended primitive types for this category
- Measurement validation guidelines
- Iteration strategies
- Convergence criteria
- Special techniques (layering, boolean operations, etc.)

**Output**: Formatted guidance for model building agents

**Coordination**: Wait for all 6 agents to complete before proceeding to Phase 3.

---

### Phase 3: MODEL BUILDING (Iterative Refinement)

This phase uses an iterative loop with convergence checking.

**Iteration Parameters**:
- Max iterations: 15 (configurable via --max-iterations flag)
- Target IoU: 0.85 (configurable via --target-iou flag)
- Early exit: If all views meet target IoU

**Iteration Loop Structure**:

```
FOR iteration = 1 TO max_iterations:

  1. Build/update model (Agent 11)
  2. Render all views (Agent 12)
  3. Calculate metrics (Agent 13)
  4. Check convergence (Agent 14)

  IF converged:
    BREAK (exit loop)

  5. Plan refinements (Agent 15)
  6. Update primitive plan

  CONTINUE to next iteration

END FOR
```

#### Agent 11: Model Builder

**Objective**: Implement primitive model in model-generator.js

**Tasks**:
- Read current primitive plan for this iteration
- Edit `/home/emeric/code/kart/primitive-modeler/model-generator.js`
- Use helper functions: addBox, addCylinder, addSphere, addCone, addTorus
- Follow 4-phase approach from METHODOLOGY.md
- Validate JavaScript syntax

**Implementation Strategy**:

**Iteration 1-3**: Phase 1 primitives (overall shape)
**Iteration 4-6**: Phase 2 primitives (major features)
**Iteration 7-10**: Phase 3 primitives (secondary details)
**Iteration 11-15**: Phase 4 primitives (fine details)

**Code Structure**:
```javascript
function generateModel() {
  const primitives = [];

  // Phase 1: Overall shape
  addBox(primitives, {
    position: [0, 0.31, 0.50],
    size: [0.85, 0.18, 0.70],
    color: 0x333333,
    name: 'main_body'
  });

  // Phase 2: Major features
  addCylinder(primitives, {
    position: [-0.25, 0.12, 0.20],
    radius: 0.11,
    height: 0.12,
    rotation: [0, 0, Math.PI/2],
    color: 0x1a1a1a,
    name: 'wheel_front_left'
  });

  // ... continue adding primitives

  return primitives;
}
```

**Validation**:
- After editing, validate syntax: `node -c model-generator.js`
- Ensure all helper functions use correct parameters
- Verify no duplicate primitive names

**Error Handling**:
- If syntax error: Fix and retry
- If helper function undefined: Check available functions
- If rendering fails: Simplify model and retry

#### Agent 12: Multi-View Renderer

**Objective**: Render all 7 views of current model

**Tasks**:
- Open `/home/emeric/code/kart/primitive-modeler/index.html` programmatically
- Trigger view capture for all 7 views (front, back, left, right, top, bottom, perspective)
- Save rendered views to `.temp/view-{viewname}.png`
- Verify all images rendered successfully

**Rendering Commands**:

The primitive-modeler system has built-in view capture. Use the existing mechanism:

```bash
# If headless rendering is available (using puppeteer/playwright)
node scripts/render-views.js --output .temp/

# Otherwise, manual approach:
# Open index.html in browser, use browser automation to:
# 1. Switch to each view
# 2. Capture canvas as PNG
# 3. Save to .temp/
```

**Expected Outputs**:
- `.temp/view-front.png`
- `.temp/view-back.png`
- `.temp/view-left.png`
- `.temp/view-right.png`
- `.temp/view-top.png`
- `.temp/view-bottom.png`
- `.temp/view-perspective.png`

**Verification**:
- Check all 7 files exist
- Verify file sizes > 0
- Validate images are readable

#### Agent 13: Metrics Calculator

**Objective**: Calculate IoU (Intersection over Union) for each view

**Tasks**:
- Load reference images
- Load rendered views
- For each view pair, calculate IoU
- Generate metrics report
- Identify worst-performing views

**IoU Calculation Method**:

Using ImageMagick for image comparison:

```bash
# Convert both images to binary masks (threshold to get silhouette)
convert reference-front.jpg -threshold 50% -negate ref-mask.png
convert view-front.png -threshold 50% -negate view-mask.png

# Calculate intersection (AND operation)
convert ref-mask.png view-mask.png -compose Multiply -composite intersection.png

# Calculate union (OR operation)
convert ref-mask.png view-mask.png -compose Screen -composite union.png

# Count pixels
intersection_pixels=$(convert intersection.png -format "%[fx:mean*w*h]" info:)
union_pixels=$(convert union.png -format "%[fx:mean*w*h]" info:)

# Calculate IoU
iou=$(echo "scale=4; $intersection_pixels / $union_pixels" | bc)
```

**Metrics Report Format**:
```json
{
  "iteration": 5,
  "timestamp": "2025-11-23T10:30:45Z",
  "metrics": {
    "front": {"iou": 0.82, "intersection": 15234, "union": 18567},
    "back": {"iou": 0.78, "intersection": 14123, "union": 18102},
    "left": {"iou": 0.85, "intersection": 16234, "union": 19099},
    "right": {"iou": 0.84, "intersection": 16001, "union": 19048},
    "top": {"iou": 0.79, "intersection": 14567, "union": 18439},
    "bottom": {"iou": 0.81, "intersection": 15012, "union": 18533},
    "perspective": {"iou": null, "note": "No reference available"}
  },
  "average_iou": 0.815,
  "min_iou": 0.78,
  "max_iou": 0.85,
  "worst_view": "back"
}
```

**Save Report**: `.temp/metrics-iteration-{N}.json`

#### Agent 14: Convergence Checker

**Objective**: Determine if model has converged to acceptable quality

**Tasks**:
- Load latest metrics report
- Check if all views meet target IoU threshold
- Determine convergence status
- Decide whether to exit loop or continue

**Convergence Criteria**:

**CONVERGED** if:
- All available views have IoU >= target_iou (default 0.85)
- OR average IoU >= target_iou + 0.05 AND no view < target_iou - 0.10

**NOT CONVERGED** if:
- Any view has IoU < target_iou
- Significant variance between views (max - min > 0.15)

**Special Cases**:
- If only 1 view available: Must meet target_iou
- If perspective view only: Target should be lower (0.75)
- If iteration >= max_iterations: Force exit with partial completion

**Output Decision**:
```json
{
  "converged": false,
  "reason": "Front and top views below threshold",
  "continue_iteration": true,
  "failing_views": ["front", "top"],
  "passing_views": ["left", "right", "back", "bottom"]
}
```

**Exit Condition**:
```json
{
  "converged": true,
  "reason": "All views meet target IoU of 0.85",
  "continue_iteration": false,
  "final_average_iou": 0.87
}
```

#### Agent 15: Refinement Planner

**Objective**: Analyze failures and plan adjustments for next iteration

**Tasks**:
- Identify which views are failing
- Analyze why those views are failing (measurements, primitives, positioning)
- Determine specific adjustments needed
- Update primitive plan for next iteration
- Prioritize high-impact changes

**Failure Analysis Strategy**:

Compare rendered view to reference:
1. Overlay images to see misalignments
2. Identify missing features (in reference but not in model)
3. Identify extra features (in model but not in reference)
4. Check proportions (too wide, too tall, too deep)
5. Check positions (shifted left/right, up/down, forward/back)

**Adjustment Categories**:

**Proportional Errors**:
- Scale primitives up/down
- Adjust width/height/depth ratios
- Modify overall dimensions

**Positional Errors**:
- Translate primitives along x/y/z axes
- Adjust relative positions between features
- Fix alignment issues

**Missing Features**:
- Add new primitives for unmodeled details
- Increase primitive count in specific areas
- Use smaller primitives for fine details

**Extra Features**:
- Remove unnecessary primitives
- Simplify over-complex areas
- Merge primitives where possible

**Refinement Plan Format**:
```json
{
  "iteration": 5,
  "adjustments": [
    {
      "primitive": "wheel_front_left",
      "change": "increase diameter from 0.22 to 0.24",
      "reason": "wheels appear too small in front view",
      "priority": "high",
      "views_affected": ["front", "left"]
    },
    {
      "primitive": "seat_back",
      "change": "move forward 0.05 units",
      "reason": "seat appears too far back in side view",
      "priority": "medium",
      "views_affected": ["left", "right"]
    },
    {
      "primitive": "NEW_steering_wheel",
      "change": "add cylinder at [0, 0.38, 0.35]",
      "reason": "steering wheel missing in front view",
      "priority": "high",
      "views_affected": ["front", "perspective"]
    }
  ]
}
```

**Priority Assignment**:
- **High**: Affects multiple failing views, large IoU impact
- **Medium**: Affects one failing view, moderate IoU impact
- **Low**: Affects passing views, minor refinement

**Coordination**: After Agent 15 completes, return to Agent 11 for next iteration.

---

### Phase 4: COMPLETION & CLEANUP

Once convergence achieved or max iterations reached, finalize the process.

#### Agent 16: Cleanup

**Objective**: Remove temporary files and organize outputs

**Tasks**:
- Delete intermediate files from `.temp/`
- Keep final metrics report
- Keep final rendered views
- Keep reference images (if downloaded)
- Remove edge detection files
- Remove intermediate masks and overlays

**Cleanup Strategy**:

**DELETE**:
- `.temp/edges-*.png`
- `.temp/sobel-*.png`
- `.temp/*-mask.png`
- `.temp/intersection-*.png`
- `.temp/union-*.png`
- `.temp/metrics-iteration-{1..N-1}.json` (keep only final)

**KEEP**:
- `.temp/reference-*.jpg` (original references)
- `.temp/view-*.png` (final rendered views)
- `.temp/metrics-final.json` (final metrics report)

**If --debug flag**:
- Keep all files for user inspection
- Create `.temp/README.txt` explaining each file

**Final Cleanup**:
```bash
# Remove temporary files
rm -f .temp/edges-*.png .temp/sobel-*.png .temp/*-mask.png
rm -f .temp/intersection-*.png .temp/union-*.png
rm -f .temp/metrics-iteration-*.json

# Rename final metrics
mv .temp/metrics-iteration-{N}.json .temp/metrics-final.json
```

#### Agent 17: Report Generator

**Objective**: Generate comprehensive completion report

**Tasks**:
- Summarize entire modeling process
- Report primitive count and iterations
- Present final IoU scores per view
- Suggest manual refinements if needed
- Provide file locations for outputs

**Report Format**:

```
3D Model Generation Complete

Object: {object_description}
Reference Images: {count} ({view types})
Total Time: {duration}

MODEL STATISTICS
- Total Primitives: {count}
- Boxes: {count}
- Cylinders: {count}
- Spheres: {count}
- Cones: {count}
- Torus: {count}

ITERATION SUMMARY
- Iterations Completed: {N}
- Convergence Status: {CONVERGED | PARTIAL | MAX_ITERATIONS}
- Final Average IoU: {value}

IoU SCORES BY VIEW
- Front:       {0.XX} {PASS|FAIL}
- Back:        {0.XX} {PASS|FAIL}
- Left:        {0.XX} {PASS|FAIL}
- Right:       {0.XX} {PASS|FAIL}
- Top:         {0.XX} {PASS|FAIL}
- Bottom:      {0.XX} {PASS|FAIL}
- Perspective: N/A

OUTPUT FILES
- Model Code:    /home/emeric/code/kart/primitive-modeler/model-generator.js
- Rendered Views: .temp/view-*.png
- Metrics Report: .temp/metrics-final.json
- Reference Images: .temp/reference-*.jpg

SUGGESTED MANUAL REFINEMENTS
{If IoU < 0.90 on any view, suggest specific improvements}
- [View]: [Specific adjustment needed]
- [View]: [Specific adjustment needed]

NEXT STEPS
1. Open primitive-modeler/index.html to view the model
2. Review metrics-final.json for detailed analysis
3. Make manual adjustments to model-generator.js if needed
4. Re-run /model with --continue flag to iterate further
```

**Suggestions Logic**:

If any view IoU < 0.90:
- Analyze which features contribute most to error
- Suggest specific primitive adjustments
- Recommend adding detail primitives
- Propose proportion tweaks

Example suggestions:
```
SUGGESTED MANUAL REFINEMENTS
- Front: Wheels appear slightly oval; try adjusting cylinder segments
- Top: Body width varies more in reference; add tapered boxes
- Left: Steering column angle off by ~5 degrees; adjust rotation
```

---

## Interactive Mode Implementation

If `--interactive` flag is present, pause for user confirmation between phases.

**Pause Points**:
1. After Phase 1 (image analysis): Show detected views, ask to continue
2. After Phase 2 (measurements): Show extracted measurements, ask to continue
3. After each iteration: Show IoU scores, ask to continue or adjust
4. Before Phase 4 (cleanup): Ask if user wants to keep debug files

**Interaction Format**:
```
PHASE 1 COMPLETE: Image Analysis

Detected Views:
- Front: .temp/reference-front.jpg (512x384)
- Left: .temp/reference-left.jpg (512x384)
- Top: .temp/reference-top.jpg (512x384)

Continue to Phase 2 (Measurement Extraction)? [y/n]
```

**User Input Handling**:
- 'y' or 'yes' or Enter: Continue
- 'n' or 'no': Abort process
- 'adjust': Allow manual adjustment before continuing
- 'skip': Skip current phase (advanced users only)

---

## Continue Mode Implementation

If `--continue` flag is present, resume from previous session.

**State Persistence**:

Save state after each phase to `.temp/model-state.json`:
```json
{
  "session_id": "uuid",
  "object_description": "go-kart",
  "started_at": "2025-11-23T10:00:00Z",
  "last_phase": 3,
  "last_iteration": 7,
  "reference_views": {
    "front": ".temp/reference-front.jpg",
    "left": ".temp/reference-left.jpg",
    "top": ".temp/reference-top.jpg"
  },
  "measurements": {...},
  "primitive_plan": {...},
  "metrics_history": [...]
}
```

**Resume Logic**:

1. Read `.temp/model-state.json`
2. Validate all referenced files still exist
3. Restore measurements and primitive plan
4. Continue from `last_iteration + 1`
5. Use existing reference images and measurements

**State Update**:
- Update after each iteration
- Append to metrics_history
- Update last_iteration and last_phase

---

## Error Handling & Recovery

### Critical Errors (Abort Process)

**Image Not Found**:
```
ERROR: Could not acquire reference image
- URL download failed: {error message}
- Suggested action: Verify URL is accessible, try alternative source

Process aborted. No changes made.
```

**ImageMagick Missing**:
```
ERROR: ImageMagick not installed
- Required for: Image processing, edge detection, metrics calculation
- Install: sudo apt install imagemagick (or brew install imagemagick)

Process aborted. Install dependencies and retry.
```

**JavaScript Syntax Error**:
```
ERROR: model-generator.js has syntax error
- Line {N}: {error message}
- Suggested fix: {automatic fix attempt}

Retrying with corrected syntax...
```

### Recoverable Errors (Retry or Adapt)

**View Classification Uncertain**:
```
WARNING: Could not confidently classify view
- Image: .temp/reference-002.jpg
- Best guess: FRONT (confidence: 0.6)
- Action: Proceeding with best guess, results may vary

Suggestion: Rename file with view keyword (e.g., reference-front.jpg)
```

**Convergence Not Reached**:
```
WARNING: Max iterations reached without full convergence
- Iterations: 15
- Best IoU: 0.82 (target: 0.85)
- Action: Saving partial result

Suggestions:
1. Review metrics-final.json for specific issues
2. Run with --continue to iterate further
3. Adjust target IoU with --target-iou 0.82
```

**Partial View Coverage**:
```
WARNING: Only 1 reference view available
- Available: FRONT
- Missing: Side and top views recommended
- Impact: Limited 3D accuracy, depth may be inaccurate

Proceeding with available view. Consider adding more references.
```

---

## Command Execution Flow

### Initialization

```
1. Parse $ARGUMENTS
2. Extract: object_description, image_urls, flags
3. Validate inputs
4. Create .temp/ directory if needed
5. Initialize state tracking
```

### Main Workflow

```
6. PHASE 1: Image Acquisition & Analysis
   - Spawn Agents 1-4 in parallel
   - Wait for all to complete
   - Validate: At least 1 reference view available
   - If --interactive: Ask user to confirm

7. PHASE 2: Measurement Extraction
   - Spawn Agents 5-10 in parallel
   - Wait for all to complete
   - Validate: Measurements extracted successfully
   - If --interactive: Show measurements, ask to confirm

8. PHASE 3: Model Building (Iterative)
   FOR iteration in 1..max_iterations:
     - Agent 11: Build/update model
     - Agent 12: Render views
     - Agent 13: Calculate metrics
     - Agent 14: Check convergence

     IF converged:
       BREAK loop

     - Agent 15: Plan refinements
     - If --interactive: Show metrics, ask to continue

     Update state
   END FOR

9. PHASE 4: Completion & Cleanup
   - Agent 16: Cleanup temporary files
   - Agent 17: Generate final report
   - If --interactive: Ask about debug file retention

10. Display final report
11. Exit
```

---

## Implementation Notes

### Agent Spawning

Use the Task tool to spawn each agent as an independent subagent:

```javascript
// Example agent spawn
Task({
  subagent_type: "general-purpose",
  description: "Image Acquisition - Download reference images",
  prompt: `You are Agent 1: Image Acquisition.

  Your task: Download the reference image from this URL to .temp/reference-original.jpg

  URL: {image_url}

  Commands to use:
  - curl -L -f -o .temp/reference-original.jpg "{image_url}"
  - Validate with: identify .temp/reference-original.jpg

  Report:
  - Success/failure status
  - Image dimensions
  - Any errors encountered

  Complete this task and report results.`
});
```

### Parallel vs Sequential Execution

**Parallel** (spawn all at once):
- Phase 1: Agents 1-4
- Phase 2: Agents 5-10

**Sequential** (spawn one at a time in loop):
- Phase 3: Agents 11-15 (repeat each iteration)

**Independent** (spawn when needed):
- Phase 4: Agents 16-17

### Progress Tracking

Show progress throughout:
```
[Phase 1/4] Image Acquisition & Analysis
  [1/4] Downloading images... DONE
  [2/4] Analyzing structure... DONE
  [3/4] Processing model sheet... DONE
  [4/4] Classifying views... DONE

[Phase 2/4] Measurement Extraction
  [1/6] Front view measurement... DONE
  [2/6] Side view measurement... DONE
  ...

[Phase 3/4] Model Building
  Iteration 1/15: IoU=0.45 (front), 0.42 (left), 0.48 (top) - Avg: 0.45
  Iteration 2/15: IoU=0.58 (front), 0.55 (left), 0.61 (top) - Avg: 0.58
  ...
  Iteration 8/15: IoU=0.86 (front), 0.87 (left), 0.85 (top) - Avg: 0.86
  CONVERGED! All views meet target IoU of 0.85

[Phase 4/4] Completion & Cleanup
  [1/2] Cleaning temporary files... DONE
  [2/2] Generating report... DONE

COMPLETE! See report above.
```

---

## Important Constraints

### From CLAUDE.md

**Zero Artifacts**:
- All temporary files in `.temp/` only
- Delete `.temp/` before completion (unless --debug)
- No analysis docs, test scripts, or experiment files in repo
- No file duplicates (model_v2.js, etc.)

**Professional Output**:
- No emojis in code, reports, or documentation
- Clear, technical prose only
- Self-documenting code structure

**Massive Parallelism**:
- Use 10+ agents for this complex workflow
- Spawn agents aggressively in Phases 1 and 2
- Coordinate efficiently between phases

**Git Discipline**:
- If making major changes to model-generator.js, commit first
- Use conventional commits: "feat(model): add {feature}"
- Never use --no-verify or skip hooks

---

## Expected Outputs

After successful completion:

**Modified Files**:
- `/home/emeric/code/kart/primitive-modeler/model-generator.js` (updated model)

**Generated Files** (in `.temp/`, kept for reference):
- `reference-*.jpg` (downloaded/processed reference images)
- `view-*.png` (final rendered views from model)
- `metrics-final.json` (final IoU metrics and analysis)

**Deleted Files** (cleanup):
- All intermediate processing files
- Edge detection outputs
- Iteration history (except final)

---

## Usage Examples

### Example 1: Single Image URL
```
/model "racing go-kart" https://example.com/kart-reference.jpg
```

### Example 2: Multiple Local Images
```
/model "office chair" ./reference-front.jpg ./reference-side.jpg ./reference-top.jpg
```

### Example 3: Interactive Mode
```
/model "sports car" https://example.com/car.jpg --interactive
```

### Example 4: Continue Previous Session
```
/model --continue
```

### Example 5: Custom Parameters
```
/model "bicycle" ./bike.jpg --max-iterations 20 --target-iou 0.90
```

---

## Argument Parsing Implementation

```javascript
// Parse $ARGUMENTS into structured data
const args = "$ARGUMENTS".split(/\s+/);
const config = {
  object_description: "",
  image_paths: [],
  flags: {
    interactive: false,
    continue: false,
    debug: false,
    max_iterations: 15,
    target_iou: 0.85
  }
};

let i = 0;
while (i < args.length) {
  const arg = args[i];

  if (arg === '--interactive') {
    config.flags.interactive = true;
  } else if (arg === '--continue') {
    config.flags.continue = true;
  } else if (arg === '--debug') {
    config.flags.debug = true;
  } else if (arg === '--max-iterations') {
    config.flags.max_iterations = parseInt(args[++i]);
  } else if (arg === '--target-iou') {
    config.flags.target_iou = parseFloat(args[++i]);
  } else if (arg.startsWith('http://') || arg.startsWith('https://') ||
             arg.startsWith('file://') || arg.startsWith('./') ||
             arg.startsWith('/')) {
    config.image_paths.push(arg);
  } else if (arg.startsWith('"')) {
    // Handle quoted description
    let desc = arg.slice(1);
    while (!desc.endsWith('"') && i < args.length - 1) {
      desc += ' ' + args[++i];
    }
    config.object_description = desc.slice(0, -1);
  } else if (!arg.startsWith('-')) {
    // Unquoted description or image path
    if (!config.object_description) {
      config.object_description = arg;
    } else {
      config.image_paths.push(arg);
    }
  }

  i++;
}

// Validate
if (!config.flags.continue && !config.object_description) {
  ERROR: "Object description required (unless using --continue)"
  EXIT
}

if (!config.flags.continue && config.image_paths.length === 0) {
  ERROR: "At least one reference image required"
  EXIT
}
```

---

## Begin Autonomous Workflow

Now that the command structure is defined, execute the workflow:

1. Parse arguments as shown above
2. Create `.temp/` directory
3. Spawn Phase 1 agents (1-4) in parallel
4. Wait for Phase 1 completion
5. Spawn Phase 2 agents (5-10) in parallel
6. Wait for Phase 2 completion
7. Enter Phase 3 iteration loop
8. Complete Phase 4 cleanup and reporting
9. Display final report
10. Exit

Follow CLAUDE.md constraints throughout:
- Spawn 10+ agents
- Zero artifacts (cleanup .temp/)
- Professional output (no emojis)
- Self-documenting code
- Git commits before major changes

Execute now.
