# Testing the Autonomous 3D Modeling System

## Quick Smoke Test

### Test 1: Simple Cube

```bash
/model "test cube"
```

Expected: Should request reference image or use placeholder

### Test 2: With URL

```bash
/model kart https://i.etsystatic.com/24599175/r/il/874e02/2820484114/il_1140xN.2820484114_a8bh.jpg
```

Expected workflow:
1. Downloads image to .temp/
2. Analyzes (likely single view)
3. Extracts measurements
4. Builds model in primitive-modeler/model-generator.js
5. Iterates until convergence
6. Reports completion

### Test 3: Local File

```bash
/model "office chair" ./reference-chair.jpg
```

Expected: Same workflow with local file copy

### Test 4: Interactive Mode

```bash
/model kart https://... --interactive
```

Expected: Asks for confirmation after each phase

## Manual Validation Steps

After running /model:

1. **Check model file:**
```bash
cat primitive-modeler/model-generator.js
```

Should contain primitives (addBox, addCylinder, etc.)

2. **View in browser:**
```bash
cd primitive-modeler/
open index.html
```

Should show model in 7 views

3. **Check metrics:**
```bash
cat .temp/metrics-report.json
```

Should show IoU scores

4. **Verify cleanup:**
```bash
ls .temp/
```

Should only have final files (no intermediate artifacts)

## Integration Tests

### ImageMagick Pipeline

```bash
# Test download
curl -L -o .temp/test.jpg https://via.placeholder.com/500

# Test identify
identify -format "%w %h" .temp/test.jpg

# Test conversion
convert .temp/test.jpg -edge 1 .temp/test-edges.png

# Cleanup
rm .temp/test*.jpg .temp/test*.png
```

### Node.js Integration

```bash
node -e "import('./primitive-modeler/image-utils.js').then(m => console.log(Object.keys(m)))"
```

Should list exported functions.

## Expected Outputs

### Successful Completion

```
3D Model Complete!

Object: kart
Primitives: 47
Iterations: 12
Time: 8m 23s

IoU Scores:
- Front: 0.89
- Back: 0.87
- Left: 0.91
- Right: 0.90
- Top: 0.88
- Bottom: 0.86
- Perspective: N/A

Model file: primitive-modeler/model-generator.js
Views: .temp/view-*.png
Metrics: .temp/metrics-report.json
```

### Partial Completion (15 iterations without convergence)

```
3D Model Partially Complete

Object: complex-machinery
Primitives: 127
Iterations: 15 (max reached)
Time: 18m 45s

IoU Scores:
- Front: 0.82 (below target)
- Back: 0.79 (below target)
- Left: 0.87
- Right: 0.86
- Top: 0.91
- Bottom: 0.84

Suggestion: Manual refinement recommended
Model file: primitive-modeler/model-generator.js
```

## Troubleshooting Tests

### Test ImageMagick

```bash
which convert
convert --version
```

### Test curl

```bash
which curl
curl --version
```

### Test Node

```bash
which node
node --version
```

## Performance Benchmarks

Expected times (on modern hardware):

- Image download: <5s
- Analysis: <10s
- Per iteration: 30-60s
- Total (10 iterations): 5-10 minutes

Slower on:
- Low bandwidth (download)
- CPU-constrained systems (ImageMagick)
- High primitive counts (>100 primitives)
