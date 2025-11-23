# Quick Start Guide - Kart Visual Testing

## Run Tests Now

### Option 1: Full Test Suite (Recommended)
```bash
npx playwright test
```

### Option 2: Watch Tests Run (Headed Mode)
```bash
npx playwright test --headed --slow-mo=500
```

### Option 3: Interactive Mode
```bash
npx playwright test --ui
```

## View Results

After running tests, screenshots are saved to:
```
/home/emeric/code/kart/.temp/screenshots/
```

View them with your favorite image viewer:
```bash
# Linux with default viewer
xdg-open /home/emeric/code/kart/.temp/screenshots/

# Or use specific image viewer
eog /home/emeric/code/kart/.temp/screenshots/*.png
```

## Expected Output

Test will:
1. Start Vite dev server automatically
2. Load kart model (wait up to 30s)
3. Capture 13+ screenshots showing:
   - Animation phases (engine compression, exhaust stagger)
   - Multiple camera angles
   - Wheel rotation
   - Material closeups
4. Verify materials and animations

## Typical Run Time

- Full suite: ~60-90 seconds
- Individual test: ~30-45 seconds

## Quick Debug

If tests fail:
```bash
npx playwright test --debug
```

This opens Playwright Inspector where you can:
- Step through each action
- Inspect DOM
- See what the test sees
- Pause at any point

## View HTML Report

After test run:
```bash
npx playwright show-report
```

Opens interactive HTML report with:
- Test results
- Screenshots on failure
- Timing information
- Error traces
