# Example Workflow: Mid-Century Modern Chair

## Introduction

This example demonstrates the complete iteration workflow for building a mid-century modern chair using the primitive 3D modeling system. The target is a classic Eames-style chair with:

- Molded plywood seat and backrest
- Four splayed wooden legs
- Angled backrest for ergonomic support
- Clean, minimalist aesthetic

The reference image shows a chair approximately 32 inches tall with a 20-inch wide seat, angled legs, and a gently curved backrest. We'll use the overlay-based iteration methodology to achieve accurate proportions and form.

---

## Iteration 1: Initial Analysis and Silhouette Blocking

### Analysis from Reference Image

```
FRONT VIEW observations:
- Overall height: 40 units from ground to backrest top
- Seat width: 20 units
- Four legs splayed outward approximately 15 degrees
- Leg spacing: 18 units at floor, 14 units at seat
- Backrest height: 14 units above seat
- Backrest width: 18 units (narrower than seat)

SIDE VIEW observations:
- Seat depth: 18 units
- Backrest tilted back approximately 12 degrees from vertical
- Seat height from ground: 18 units
- Legs angle forward at bottom approximately 8 degrees
- Seat curves downward slightly at front edge

TOP VIEW observations:
- Rectangular seat with rounded corners
- Four legs positioned at corners with outward splay
- Backrest centered on rear edge

MEASUREMENTS (proportional ratios):
- Leg diameter: 1.2 units (tapered from 1.4 at top)
- Seat thickness: 2.5 units (thicker for molded curve)
- Backrest thickness: 1.0 unit
- Leg taper ratio: 0.85 (top/bottom)
```

### Phase 1: Silhouette with 8 Core Primitives

```javascript
// Seat base
box(20, 2.5, 18, 0, 18, 0);

// Backrest
box(18, 14, 1.0, 0, 27, -8.5)
  .rotateX(12);

// Four legs (initial vertical placement)
cylinder(1.4, 1.2, 18, -7, 9, 7);
cylinder(1.4, 1.2, 18, 7, 9, 7);
cylinder(1.4, 1.2, 18, -7, 9, -7);
cylinder(1.4, 1.2, 18, 7, 9, -7);
```

**Generated overlay shows:**
- Front IoU: 0.58
- Side IoU: 0.54
- Top IoU: 0.61

---

## Iteration 2: Leg Angle Corrections

### Overlay Analysis

```
FRONT VIEW mismatches:
- Legs too vertical (need outward splay)
- Leg base spacing: actual 18 units, rendered 14 units
- Top spacing correct at 14 units

SIDE VIEW mismatches:
- Legs perpendicular to ground (need forward tilt)
- Backrest angle close but slightly insufficient

TOP VIEW mismatches:
- Leg positions form square instead of splayed rectangle
```

### Priority Fix: Leg Splay Angles

The biggest visual mismatch is the leg geometry. Each leg needs to splay outward from the seat. Using rotateZ for front/back legs and rotateX for side splay:

```javascript
// Front-left leg (splay left and forward)
cylinder(1.4, 1.2, 18, -7, 9, 7)
  .rotateZ(15)
  .rotateX(8)
  .translate(-0.8, 0, 0.6);

// Front-right leg (splay right and forward)
cylinder(1.4, 1.2, 18, 7, 9, 7)
  .rotateZ(-15)
  .rotateX(8)
  .translate(0.8, 0, 0.6);

// Back-left leg (splay left and backward)
cylinder(1.4, 1.2, 18, -7, 9, -7)
  .rotateZ(15)
  .rotateX(-8)
  .translate(-0.8, 0, -0.6);

// Back-right leg (splay right and backward)
cylinder(1.4, 1.2, 18, 7, 9, -7)
  .rotateZ(-15)
  .rotateX(-8)
  .translate(0.8, 0, -0.6);
```

**New metrics:**
- Front IoU: 0.71 (improved)
- Side IoU: 0.68 (improved)
- Top IoU: 0.74 (improved)

---

## Iteration 3: Seat and Backrest Position Refinement

### Overlay Analysis

```
FRONT VIEW mismatches:
- Seat appears 1 unit too high
- Backrest width matches well
- Overall silhouette improving

SIDE VIEW mismatches:
- Backrest angle now close (within 2 degrees)
- Seat front edge alignment good
- Backrest base connection point off by 0.5 units

CROSS-VIEW VALIDATION:
- Front and side leg positions now consistent
- Top view confirms splay angles correct
```

### Adjustments

```javascript
// Lower seat by 1 unit
box(20, 2.5, 18, 0, 17, 0);

// Adjust backrest position and increase angle slightly
box(18, 14, 1.0, 0, 26.5, -8.5)
  .rotateX(13);

// Update leg Y positions to match new seat height
// (subtract 1 from previous Y coordinates)
cylinder(1.4, 1.2, 18, -7, 8, 7)
  .rotateZ(15)
  .rotateX(8)
  .translate(-0.8, 0, 0.6);
// (repeat for other three legs with Y=8)
```

**New metrics:**
- Front IoU: 0.79
- Side IoU: 0.76
- Top IoU: 0.74

---

## Iteration 4: Seat Curve and Corner Refinement

### Overlay Analysis

```
Silhouette mostly correct now, but edge details show:
- Seat corners too sharp (reference shows rounding)
- Seat front edge curves down slightly
- Backrest top edge has subtle curve
```

### Adding Curve Details

```javascript
// Replace flat seat with curved composition
// Main seat platform
box(20, 1.5, 18, 0, 17.5, 0);

// Front edge curve (rotated box)
box(20, 1.5, 6, 0, 16.8, 6)
  .rotateX(-5);

// Rear section (flat)
box(20, 1.5, 6, 0, 17.5, -6);

// Corner rounding with small cylinders
cylinder(1.5, 1.5, 2.5, 9, 17, 8)
  .rotateZ(90);
cylinder(1.5, 1.5, 2.5, -9, 17, 8)
  .rotateZ(90);
```

**New metrics:**
- Front IoU: 0.82
- Side IoU: 0.81
- Top IoU: 0.79

---

## Iteration 5: Backrest Shape Refinement

### Overlay Analysis

```
FRONT VIEW:
- Backrest top edge should curve slightly
- Width tapering at top (18 units to 16 units)

SIDE VIEW:
- Backrest thickness correct
- Subtle forward curve at top needed
```

### Backrest Geometry Update

```javascript
// Lower backrest section (straight)
box(18, 8, 1.0, 0, 23, -8.5)
  .rotateX(13);

// Upper backrest section (tapered)
box(16, 6, 1.0, 0, 30, -9.0)
  .rotateX(13);

// Top curve accent
cylinder(16, 16, 1.0, 0, 33, -9.2)
  .rotateY(90)
  .rotateZ(13);
```

**New metrics:**
- Front IoU: 0.86 (threshold exceeded)
- Side IoU: 0.84 (close)
- Top IoU: 0.81

---

## Iteration 6: Cross-View Validation and Minor Adjustments

### Validation Check

```
All primary views approaching threshold:
- Front: 0.86 ✓
- Back: 0.84 (need slight improvement)
- Left: 0.83
- Right: 0.83
- Top: 0.81
- Bottom: 0.78

Side view still below threshold - investigating.
```

### Side View Analysis

```
SIDE VIEW mismatch:
- Leg bottom positions 0.3 units too far forward
- Seat depth rendering correctly
- Backrest angle perfect now
```

### Leg Translation Adjustment

```javascript
// Reduce forward translation on all legs from 0.6 to 0.3
// Front legs:
translate(-0.8, 0, 0.3);  // was 0.6
translate(0.8, 0, 0.3);

// Back legs:
translate(-0.8, 0, -0.3);  // was -0.6
translate(0.8, 0, -0.3);
```

**New metrics:**
- Side IoU: 0.87 ✓
- Left IoU: 0.86 ✓
- Right IoU: 0.86 ✓

---

## Iteration 7: Phase 2 - Adding Structural Details

### Analysis

With silhouette matching (all views > 0.85), moving to Phase 2: major features.

Reference image shows:
- Metal cross-brace connecting legs under seat
- Rubber foot caps on leg bottoms
- Subtle seat-to-backrest connection brackets

### Adding Support Structure

```javascript
// Cross-brace connecting front legs
cylinder(0.6, 0.6, 16, 0, 5, 7)
  .rotateY(90);

// Cross-brace connecting back legs
cylinder(0.6, 0.6, 16, 0, 5, -7)
  .rotateY(90);

// Side braces (left and right)
cylinder(0.6, 0.6, 14, -8, 5, 0)
  .rotateX(90);
cylinder(0.6, 0.6, 14, 8, 5, 0)
  .rotateX(90);

// Foot caps (small spheres)
sphere(1.0, -8.5, 0.5, 8);
sphere(1.0, 8.5, 0.5, 8);
sphere(1.0, -8.5, 0.5, -8);
sphere(1.0, 8.5, 0.5, -8);
```

**Metrics remain stable** (structural details don't affect silhouette significantly):
- All views: 0.85-0.87 range

---

## Iteration 8: Backrest Connection Hardware

### Detail Addition

```javascript
// Left bracket connecting backrest to seat
box(1.5, 3, 0.8, -7, 19, -8)
  .rotateX(13);

// Right bracket
box(1.5, 3, 0.8, 7, 19, -8)
  .rotateX(13);

// Bracket bolts (small cylinders)
cylinder(0.3, 0.3, 1.2, -7, 19, -8)
  .rotateY(90);
cylinder(0.3, 0.3, 1.2, 7, 19, -8)
  .rotateY(90);
```

---

## Iteration 9: Surface Detail and Texture Indication

### Analysis

Reference shows:
- Wood grain direction on seat (front-to-back)
- Subtle panel lines on backrest
- Leg grain vertical

Using subtle geometry to indicate material properties:

```javascript
// Seat grain lines (very shallow boxes)
box(20, 0.05, 0.2, 0, 18.8, 2);
box(20, 0.05, 0.2, 0, 18.8, -2);

// Backrest center seam
box(0.1, 14, 1.0, 0, 27, -8.5)
  .rotateX(13);
```

**Metrics:**
- All views: 0.86-0.88 range (slight improvements from detail)

---

## Iteration 10: Final Edge Alignment

### Precision Check

```
EDGE ALIGNMENT ANALYSIS:
- Seat corners: 3% deviation
- Backrest top curve: 4% deviation
- Leg bottom positions: 2% deviation
- Overall RMSE: 0.08 (excellent)
```

### Final Micro-adjustments

```javascript
// Adjust backrest top curve radius slightly
cylinder(16.5, 16.5, 1.0, 0, 33, -9.2)  // was 16
  .rotateY(90)
  .rotateZ(13);

// Fine-tune seat corner rounding
cylinder(1.6, 1.6, 2.5, 9, 17, 8)  // was 1.5
  .rotateZ(90);
```

---

## Final Results

### Convergence Metrics

```
FINAL IoU SCORES:
- Front view: 0.89
- Back view: 0.87
- Left view: 0.88
- Right view: 0.88
- Top view: 0.86
- Bottom view: 0.85

EDGE ALIGNMENT:
- Average deviation: 2.1% (target: <5%)
- Maximum deviation: 4.3%
- RMSE: 0.07

CONVERGENCE ACHIEVED:
- All views exceed 0.85 threshold
- Edge alignment within tolerance
- 43 total primitives used
- Completed in 10 iterations
```

### Key Learnings

1. **Measurement First**: Taking time for detailed initial analysis from reference images prevented major rework later. Accurate proportions from iteration 1 saved 3-4 correction cycles.

2. **Cross-View Validation Critical**: Leg splay angles looked correct in front view but top view revealed positioning errors. Always validate changes across all views before proceeding.

3. **One Change at a Time**: When tempted to adjust legs, seat, and backrest simultaneously in iteration 2, focusing only on legs prevented confusion and made metric changes interpretable.

4. **Silhouette Before Details**: Reaching >0.85 IoU on all views before adding cross-braces and hardware ensured details enhanced rather than fought the base form.

5. **Rotation Order Matters**: Leg transformations required specific sequencing (rotate, then translate) to achieve correct compound angles. Wrong order caused legs to point in unexpected directions.

6. **Patience with Convergence**: Metrics improved slowly from iteration 5-7 (0.82 to 0.87), but small refinements accumulated. Resisting urge to make large changes maintained stability.

7. **Reference Image Quality**: Having clear front, side, and perspective views of the reference chair eliminated guesswork. Single-view references would have required more iterations.

Total primitive count: 43
Total development time: 10 iterations
Final quality: Production-ready match to reference
