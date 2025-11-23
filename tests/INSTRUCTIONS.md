# Complete Instructions for Running Playwright Visual Tests

## Prerequisites

Everything is already installed:
- Playwright v1.56.1
- @playwright/test
- Chromium browser (will auto-install if needed)

## Fastest Way to Run

### Method 1: Direct Command (Recommended)
```bash
npx playwright test
```

### Method 2: Helper Script
```bash
./tests/run-visual-test.sh
```

Both commands will:
1. Start Vite dev server automatically
2. Run 3 tests in sequence
3. Save 14+ screenshots to `.temp/screenshots/`
4. Show results in terminal

## Expected Timeline

```
[0:00] Starting web server (Vite)
[0:03] Web server ready at http://localhost:5173
[0:05] Test 1: Model Loading and Animation Capture starts
[0:08] - Model loaded successfully
[0:10] - Capturing initial state
[0:15] - Capturing animation phases
[0:25] - Testing camera angles
[0:35] - Testing wheel rotation
[0:45] Test 1: Complete (13+ screenshots saved)
[0:50] Test 2: Material Verification starts
[1:00] Test 2: Complete (materials verified)
[1:05] Test 3: Animation Stagger Verification starts
[1:15] Test 3: Complete (animation confirmed)
[1:20] All tests complete!
```

Total time: 60-90 seconds

## What You'll See (Headless Mode)

```
Running 3 tests using 1 worker

  ✓ [chromium] › kart-visual.spec.js:16:3 › Kart Model Visual Verification › should load kart model and capture animation states (45s)
  ✓ [chromium] › kart-visual.spec.js:243:3 › Kart Model Visual Verification › should verify materials are applied correctly (15s)
  ✓ [chromium] › kart-visual.spec.js:307:3 › Kart Model Visual Verification › should verify animations are running with stagger (12s)

  3 passed (1.2m)
```

## Viewing Results

### Screenshots
```bash
# Open screenshot directory
xdg-open /home/emeric/code/kart/.temp/screenshots/

# Or use specific image viewer
eog /home/emeric/code/kart/.temp/screenshots/*.png
```

### HTML Report
```bash
# View detailed HTML report
npx playwright show-report
```

## Different Test Modes

### 1. Headless Mode (Default)
Tests run in background, no browser window visible.

```bash
npx playwright test
```

Best for: Quick verification, CI/CD

### 2. Headed Mode
Browser window visible, watch tests run in real-time.

```bash
npx playwright test --headed
```

Best for: Understanding what's happening, debugging

### 3. Slow Motion Mode
Browser visible, each action delayed by 500ms.

```bash
npx playwright test --headed --slow-mo=500
```

Best for: Visual inspection, demos, learning

### 4. Interactive UI Mode
Graphical interface for running/debugging tests.

```bash
npx playwright test --ui
```

Best for: Selective test execution, exploration

### 5. Debug Mode
Step through tests with Playwright Inspector.

```bash
npx playwright test --debug
```

Best for: Troubleshooting failures, understanding test flow

## Using the Helper Script

The helper script provides convenient shortcuts:

```bash
# Headless mode (default)
./tests/run-visual-test.sh

# Headed mode
./tests/run-visual-test.sh headed

# Slow motion
./tests/run-visual-test.sh slow

# Debug mode
./tests/run-visual-test.sh debug

# Interactive UI
./tests/run-visual-test.sh ui

# View report
./tests/run-visual-test.sh report

# Clean up artifacts
./tests/run-visual-test.sh clean

# Show help
./tests/run-visual-test.sh help
```

## What Gets Tested

### Test 1: Model Loading and Animation Capture (45 seconds)

Verifies:
- Model loads successfully
- Canvas renders correctly
- Animation plays
- Camera controls work
- Wheel rotation works

Captures:
- 13 screenshots from different angles and animation states
- Initial state, animation phases, multiple views
- Wheel rotation forward/backward

### Test 2: Material Verification (15 seconds)

Verifies:
- Materials are applied to meshes
- Metallic materials exist (metalness > 0.5)
- Rough materials exist (roughness > 0.8)
- Material properties are correct

Logs:
- Material names, metalness, roughness values
- Texture map presence
- First 20 materials shown in console

### Test 3: Animation Stagger Verification (12 seconds)

Verifies:
- Engine animation is running
- Scale values change over time
- Stagger effect is present

Samples:
- 20 scale measurements over 1 second
- Calculates min/max/range
- Confirms animation variation

## Understanding the Output

### Console Logs

During test execution, you'll see:
```
Navigating to kart game page...
Canvas element is visible
Waiting for kart model to load...
Model loaded successfully!
Capturing screenshot: initial state (t=0s)
Waiting for t=0.5s (engine compressed)...
[... more progress logs ...]
All screenshots saved to: /home/emeric/code/kart/.temp/screenshots
```

### Screenshot Files

All screenshots are named descriptively:
- `01-initial-state-t0s.png`
- `02-engine-compressed-t0.5s.png`
- `03-exhaust1-compressed-t1.0s.png`
- etc.

Numbers indicate sequence, names describe content.

### Material Information

Material verification logs show:
```
Material properties found:
  wheel_mesh [rim_material]: metalness=0.9, roughness=0.2, hasMap=true
  tire_mesh [tire_material]: metalness=0, roughness=0.95, hasMap=true
  [... more materials ...]

Found 12 metallic materials (metalness > 0.5)
Found 8 rough materials (roughness > 0.8)
```

### Animation Samples

Animation verification logs show:
```
Engine scale samples over time:
  Sample 0: x=1.0234, y=1.0234, z=1.0234
  Sample 1: x=1.0189, y=1.0189, z=1.0189
  Sample 2: x=1.0098, y=1.0098, z=1.0098
  [... more samples ...]

Scale range: 0.9876 to 1.0456 (range: 0.0580)
Animation verified: engine scale is changing over time
```

## Troubleshooting

### Problem: Model doesn't load

**Symptoms:**
- "Model failed to load within timeout" error
- Test fails after 30 seconds
- Debug screenshot `model-load-timeout.png` created

**Solutions:**
1. Verify model file exists:
   ```bash
   ls -lh assets/models/kart/pipeframe64_mario.dae
   ```

2. Check dev server manually:
   ```bash
   npm run dev
   # Open http://localhost:5173 in browser
   ```

3. Increase timeout in test file (line 9):
   ```javascript
   const MODEL_LOAD_TIMEOUT = 60000; // Increase to 60 seconds
   ```

### Problem: Screenshots are blank or black

**Symptoms:**
- Screenshots saved but show black/blank screen
- No visible content in images

**Solutions:**
1. Run in headed mode to see rendering:
   ```bash
   npx playwright test --headed
   ```

2. Increase wait times after camera movements (test file line ~65):
   ```javascript
   await page.waitForTimeout(1000); // Increase from 500ms to 1000ms
   ```

3. Check WebGL is working:
   ```bash
   chromium --enable-logging --v=1
   # Then visit chrome://gpu to check WebGL status
   ```

### Problem: Animation not detected

**Symptoms:**
- Test fails with "scale range too small"
- Logs show no scale variation

**Solutions:**
1. Check console for "Engine mesh found: Yes":
   ```bash
   npx playwright test --headed
   # Watch browser console
   ```

2. Verify animation code in main.js (lines 806-811)

3. Check timing - may need more samples:
   ```javascript
   const sampleCount = 40; // Increase from 20 to 40
   ```

### Problem: Dev server won't start

**Symptoms:**
- "Port 5173 already in use" error
- Server timeout after 120 seconds

**Solutions:**
1. Check if server is already running:
   ```bash
   lsof -i :5173
   ```

2. Kill existing server:
   ```bash
   pkill -f vite
   ```

3. Start server manually before tests:
   ```bash
   npm run dev
   # In another terminal:
   npx playwright test
   ```

4. Use different port in config (playwright.config.js):
   ```javascript
   baseURL: 'http://localhost:5174',
   webServer: {
     command: 'npm run dev -- --port 5174',
     url: 'http://localhost:5174',
   }
   ```

### Problem: Tests are too slow

**Symptoms:**
- Tests take longer than 2 minutes
- Timeouts occur

**Solutions:**
1. Check system resources (CPU, memory)

2. Reduce screenshot count (remove some camera angles)

3. Reduce animation sample count:
   ```javascript
   const sampleCount = 10; // Reduce from 20 to 10
   ```

4. Skip material verification test:
   ```bash
   npx playwright test -g "should load kart model"
   ```

## Advanced Usage

### Run Single Test

```bash
# Run only model loading test
npx playwright test -g "should load kart model"

# Run only material verification
npx playwright test -g "should verify materials"

# Run only animation verification
npx playwright test -g "should verify animations"
```

### Run with Specific Browser

```bash
# Use Firefox (requires config change)
npx playwright test --project=firefox

# Use WebKit (requires config change)
npx playwright test --project=webkit
```

### Generate Trace

```bash
# Run with trace
npx playwright test --trace on

# View trace
npx playwright show-trace trace.zip
```

### Update Snapshots (for visual regression)

```bash
# Update all snapshots
npx playwright test --update-snapshots

# Update specific test
npx playwright test -g "should load kart model" --update-snapshots
```

## Maintenance

### Update Playwright

```bash
npm update @playwright/test playwright
npx playwright install chromium
```

### Clean Up

```bash
# Remove screenshots only
rm -rf .temp/screenshots/*

# Remove all artifacts
./tests/run-visual-test.sh clean

# Or manually
rm -rf .temp/ playwright-report/ test-results/
```

### Add New Screenshots

Edit `tests/kart-visual.spec.js` and add:

```javascript
// After existing screenshots
console.log('Capturing custom view...');
await orbitCamera(100, 50); // Adjust angle
await page.screenshot({
  path: path.join(SCREENSHOT_DIR, '14-custom-view.png'),
  fullPage: false
});
```

### Modify Animation Timing

Edit test file (around line 88):

```javascript
// Change timing for different animation phases
await page.waitForTimeout(750); // Was 500ms, now 750ms
```

## Integration with Development Workflow

### During Development

Run tests after changes:
```bash
# Make code changes
vim main.js

# Run visual tests
npx playwright test

# Check screenshots
xdg-open .temp/screenshots/
```

### Before Committing

```bash
# Run tests
npx playwright test

# Verify all pass
# Screenshots in .temp/ won't be committed (in .gitignore)

# Commit code changes
git add main.js
git commit -m "fix: improve kart materials"
```

### In CI/CD

```bash
# Install browsers
npx playwright install chromium

# Run tests
CI=true npx playwright test

# Upload artifacts
# Screenshots in .temp/screenshots/
# Report in playwright-report/
```

## Getting Help

1. Check test output in terminal
2. View HTML report: `npx playwright show-report`
3. Run in debug mode: `npx playwright test --debug`
4. Check this documentation
5. Review `tests/README.md` for detailed info
6. Check `.temp/PLAYWRIGHT_SETUP_SUMMARY.md` for technical details

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────────┐
│ PLAYWRIGHT VISUAL TESTS - QUICK REFERENCE                   │
├─────────────────────────────────────────────────────────────┤
│ RUN TESTS                                                    │
│   npx playwright test                    # Run all tests     │
│   npx playwright test --headed           # Watch tests run   │
│   npx playwright test --debug            # Debug mode        │
│   npx playwright test --ui               # Interactive UI   │
│                                                              │
│ HELPER SCRIPT                                                │
│   ./tests/run-visual-test.sh             # Default run      │
│   ./tests/run-visual-test.sh headed      # Watch tests      │
│   ./tests/run-visual-test.sh slow        # Slow motion      │
│   ./tests/run-visual-test.sh clean       # Clean artifacts  │
│                                                              │
│ VIEW RESULTS                                                 │
│   xdg-open .temp/screenshots/            # View screenshots │
│   npx playwright show-report             # View HTML report │
│                                                              │
│ LOCATION                                                     │
│   Tests: tests/kart-visual.spec.js                          │
│   Config: playwright.config.js                              │
│   Output: .temp/screenshots/                                │
│                                                              │
│ EXPECTED DURATION                                            │
│   Total: 60-90 seconds for all 3 tests                      │
│                                                              │
│ DOCUMENTATION                                                │
│   TESTING.md              # Overview                        │
│   tests/QUICKSTART.md     # Quick start                     │
│   tests/README.md         # Full docs                       │
│   tests/INSTRUCTIONS.md   # This file                       │
└─────────────────────────────────────────────────────────────┘
```

---

**Ready to run! Execute: `npx playwright test`**
