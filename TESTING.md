# Visual Testing with Playwright

This project includes comprehensive Playwright tests for visual verification of the kart model's materials and animations.

## Quick Start

Run tests immediately:
```bash
npx playwright test
```

Or use the helper script:
```bash
./tests/run-visual-test.sh
```

## Documentation

- **QUICKSTART**: `tests/QUICKSTART.md` - Quick reference commands
- **README**: `tests/README.md` - Full documentation and troubleshooting
- **SUMMARY**: `.temp/PLAYWRIGHT_SETUP_SUMMARY.md` - Complete technical details

## Common Commands

```bash
# Run all tests (headless)
npx playwright test

# Watch tests run with visible browser
npx playwright test --headed

# Slow motion for visual inspection
npx playwright test --headed --slow-mo=500

# Interactive UI mode
npx playwright test --ui

# Debug with inspector
npx playwright test --debug

# View HTML report
npx playwright show-report
```

## Using the Helper Script

```bash
# Run headless (default)
./tests/run-visual-test.sh

# Watch tests run
./tests/run-visual-test.sh headed

# Slow motion mode
./tests/run-visual-test.sh slow

# Debug mode
./tests/run-visual-test.sh debug

# Interactive UI
./tests/run-visual-test.sh ui

# View report
./tests/run-visual-test.sh report

# Clean artifacts
./tests/run-visual-test.sh clean

# Show help
./tests/run-visual-test.sh help
```

## Test Coverage

### 1. Model Loading and Animation Capture
- Waits for model to load (30s timeout)
- Captures 13+ screenshots at different animation phases
- Tests multiple camera angles (left, right, top, rear, isometric)
- Verifies wheel rotation (forward/backward)
- Saves screenshots to `.temp/screenshots/`

### 2. Material Verification
- Extracts all material properties from scene
- Verifies metallic materials (rims, metal parts)
- Verifies rough materials (tires, fabric)
- Logs material properties to console

### 3. Animation Stagger Verification
- Samples engine scale over time (20 samples)
- Verifies animation is running
- Validates scale changes (stagger effect)

## Output Location

Screenshots are saved to:
```
/home/emeric/code/kart/.temp/screenshots/
```

View with:
```bash
xdg-open /home/emeric/code/kart/.temp/screenshots/
```

## Screenshot Manifest

- `01-initial-state-t0s.png` - Initial rendering state
- `02-engine-compressed-t0.5s.png` - Engine at compression point
- `03-exhaust1-compressed-t1.0s.png` - First exhaust compression
- `04-exhaust2-compressed-t1.5s.png` - Second exhaust compression (staggered)
- `05-left-side-view.png` - Left side perspective
- `06-right-side-view.png` - Right side perspective
- `07-top-view.png` - Top-down view
- `08-rear-view.png` - Rear view
- `09-front-isometric-view.png` - Front isometric angle
- `10-closeup-materials.png` - Zoomed view of materials
- `11-wheels-rotating-forward.png` - Wheels spinning forward
- `12-wheels-rotating-backward.png` - Wheels spinning backward
- `13-final-animation-state.png` - Final animation frame
- `materials-verification.png` - Material properties verification

## Configuration

Test configuration is in `playwright.config.js`:
- Auto-starts Vite dev server on `http://localhost:5173`
- 120 second server startup timeout
- 30 second model load timeout
- Uses Chromium browser
- Sequential execution (1 worker)

## Troubleshooting

### Model doesn't load
Check that `assets/models/kart/pipeframe64_mario.dae` exists and dev server is running.

### Screenshots are blank
Run in headed mode to see what's happening: `npx playwright test --headed`

### Animation not detected
Verify engine mesh exists in console logs.

### Server won't start
Check if port 5173 is available: `lsof -i :5173`

## CI/CD Integration

Install browsers first:
```bash
npx playwright install chromium
```

Then run tests:
```bash
CI=true npx playwright test
```

## Files Created

- `playwright.config.js` - Playwright configuration
- `tests/kart-visual.spec.js` - Test suite (3 tests)
- `tests/README.md` - Full documentation
- `tests/QUICKSTART.md` - Quick reference
- `tests/run-visual-test.sh` - Helper script
- `.temp/screenshots/` - Screenshot output directory

## Next Steps

After running tests:
1. Review screenshots in `.temp/screenshots/`
2. Check HTML report: `npx playwright show-report`
3. Verify materials look correct
4. Confirm animation stagger is visible

For detailed information, see `tests/README.md` or `.temp/PLAYWRIGHT_SETUP_SUMMARY.md`
