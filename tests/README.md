# Kart Visual Testing with Playwright

This directory contains Playwright tests for visual verification of the kart model's materials and animations.

## Prerequisites

- Node.js and npm installed
- Playwright installed (already in package.json)
- Dev server accessible (Vite)

## Running the Tests

### Basic Usage

Run all tests:
```bash
npx playwright test
```

Run with UI mode (interactive):
```bash
npx playwright test --ui
```

Run in headed mode (see browser):
```bash
npx playwright test --headed
```

Run with slow motion (for visual inspection):
```bash
npx playwright test --headed --slow-mo=1000
```

Run specific test file:
```bash
npx playwright test tests/kart-visual.spec.js
```

### Debug Mode

Run in debug mode with Playwright Inspector:
```bash
npx playwright test --debug
```

## Test Structure

### kart-visual.spec.js

Contains three test suites:

1. **Model Loading and Animation Capture**
   - Loads the kart model
   - Waits for "Downloaded kart model loaded successfully" console message
   - Captures screenshots at different animation times (t=0s, 0.5s, 1.0s, 1.5s)
   - Captures screenshots from multiple camera angles (left, right, top, rear, isometric)
   - Tests wheel rotation with forward/backward motion
   - Saves all screenshots to `/home/emeric/code/kart/.temp/screenshots/`

2. **Material Verification**
   - Verifies materials are applied correctly
   - Checks for metallic materials (metalness > 0.5)
   - Checks for rough materials (roughness > 0.8)
   - Logs material properties to console
   - Takes verification screenshot

3. **Animation Stagger Verification**
   - Samples engine scale over time
   - Verifies animation is running (scale values change)
   - Validates stagger effect is present

## Output

All screenshots are saved to:
```
/home/emeric/code/kart/.temp/screenshots/
```

Screenshot manifest:
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

Test configuration is in `/home/emeric/code/kart/playwright.config.js`:

- Web server starts automatically on `http://localhost:5173`
- Uses Vite dev server (`npm run dev`)
- 120 second timeout for server startup
- Single worker (sequential execution)
- Chromium browser only (for consistent rendering)

## Troubleshooting

### Model doesn't load

If you see "Model failed to load within timeout":
1. Check that the model file exists at `assets/models/kart/pipeframe64_mario.dae`
2. Check browser console for loading errors
3. Verify Vite dev server is running correctly
4. A debug screenshot will be saved at `model-load-timeout.png`

### Screenshots are blank or black

1. Increase wait times in the test
2. Check that WebGL is working in the browser
3. Run in headed mode to see what's happening: `--headed`

### Animation not detected

1. Verify the engine mesh is being found in the model
2. Check console logs for "Engine mesh found: Yes"
3. Run with debug mode to inspect the timing

## Extending Tests

To add more test scenarios:

1. Edit `tests/kart-visual.spec.js`
2. Add new `test()` blocks within the describe block
3. Use existing helper functions for camera orbit and screenshots
4. Follow naming convention for screenshots: `##-description-details.png`

## CI/CD Integration

To run in CI environments:

```bash
# Install browsers first
npx playwright install chromium

# Run tests headless
npx playwright test

# Generate HTML report
npx playwright show-report
```

Set `CI=true` environment variable to enable:
- 2 retries on failure
- No server reuse
- Optimized for CI performance
