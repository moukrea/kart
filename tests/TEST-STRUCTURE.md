# Playwright Test Structure and Flow

## Directory Structure

```
/home/emeric/code/kart/
├── playwright.config.js          # Playwright configuration
├── TESTING.md                     # Quick start guide
├── tests/
│   ├── kart-visual.spec.js       # Test suite (3 tests)
│   ├── INSTRUCTIONS.md           # Complete instructions
│   ├── QUICKSTART.md             # Quick reference
│   ├── README.md                 # Full documentation
│   ├── TEST-STRUCTURE.md         # This file
│   └── run-visual-test.sh        # Helper script (executable)
└── .temp/                         # Temporary files (gitignored)
    ├── screenshots/               # Test output (14+ PNG files)
    └── PLAYWRIGHT_SETUP_SUMMARY.md
```

## Test Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    START TEST EXECUTION                      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Start Vite Dev Server      │
        │   http://localhost:5173      │
        │   (120s timeout)             │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Create Screenshot Dir      │
        │   .temp/screenshots/         │
        └──────────────┬───────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  TEST 1: Model Loading and Animation Capture (45s)           │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Navigate to http://localhost:5173                │    │
│  │ 2. Wait for canvas element visible                  │    │
│  │ 3. Listen for console: "model loaded successfully"  │    │
│  │ 4. Wait for model load (30s timeout)                │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ANIMATION CAPTURE (t=0s to t=1.5s)                  │    │
│  │                                                      │    │
│  │ t=0.0s → Screenshot: 01-initial-state-t0s.png       │    │
│  │ t=0.5s → Screenshot: 02-engine-compressed-t0.5s.png │    │
│  │ t=1.0s → Screenshot: 03-exhaust1-compressed-t1.0s   │    │
│  │ t=1.5s → Screenshot: 04-exhaust2-compressed-t1.5s   │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CAMERA ANGLE CAPTURE (Multiple Views)               │    │
│  │                                                      │    │
│  │ Orbit(-300,0)  → 05-left-side-view.png              │    │
│  │ Orbit(+600,0)  → 06-right-side-view.png             │    │
│  │ Orbit(-300,-300)→ 07-top-view.png                   │    │
│  │ Orbit(0,+150)  → 08-rear-view.png                   │    │
│  │ Orbit(-300,0)  → 09-front-isometric-view.png        │    │
│  │ Zoom(-500)     → 10-closeup-materials.png           │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ WHEEL ROTATION TEST                                 │    │
│  │                                                      │    │
│  │ kartSpeed = 5  → Wait 1s → Screenshot 11            │    │
│  │ kartSpeed = -5 → Wait 1s → Screenshot 12            │    │
│  │ kartSpeed = 0  → Wait 0.5s→ Screenshot 13           │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ VERIFICATION                                        │    │
│  │                                                      │    │
│  │ ✓ Scene has children                                │    │
│  │ ✓ Camera position correct                           │    │
│  │ ✓ 13+ screenshots saved                             │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  TEST 2: Material Verification (15s)                          │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Navigate to page                                 │    │
│  │ 2. Wait for canvas and model                        │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ TRAVERSE SCENE GRAPH                                │    │
│  │                                                      │    │
│  │ For each mesh:                                      │    │
│  │   - Extract material name                           │    │
│  │   - Record metalness value                          │    │
│  │   - Record roughness value                          │    │
│  │   - Check for texture map                           │    │
│  │   - Store in materials array                        │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ ANALYSIS AND VERIFICATION                           │    │
│  │                                                      │    │
│  │ ✓ Materials exist (count > 0)                       │    │
│  │ ✓ Metallic materials (metalness > 0.5)              │    │
│  │ ✓ Rough materials (roughness > 0.8)                 │    │
│  │ ✓ Log first 20 materials to console                 │    │
│  │ ✓ Save screenshot: materials-verification.png       │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
┌──────────────────────────────────────────────────────────────┐
│                                                               │
│  TEST 3: Animation Stagger Verification (12s)                │
│                                                               │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ 1. Navigate to page                                 │    │
│  │ 2. Wait for canvas and model                        │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ SAMPLE ENGINE SCALE OVER TIME                       │    │
│  │                                                      │    │
│  │ Loop 20 times (50ms intervals):                     │    │
│  │   - Find engine mesh in scene                       │    │
│  │   - Record scale.x, scale.y, scale.z                │    │
│  │   - Wait 50ms                                       │    │
│  │   - Repeat                                          │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ CALCULATE SCALE VARIATION                           │    │
│  │                                                      │    │
│  │ scale_values = [s0, s1, s2, ..., s19]               │    │
│  │ min_scale = min(scale_values)                       │    │
│  │ max_scale = max(scale_values)                       │    │
│  │ scale_range = max_scale - min_scale                 │    │
│  └────────────────────┬────────────────────────────────┘    │
│                       │                                      │
│                       ▼                                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │ VERIFICATION                                        │    │
│  │                                                      │    │
│  │ ✓ Engine mesh found                                 │    │
│  │ ✓ Scale range > 0.001                               │    │
│  │ ✓ Animation is running                              │    │
│  │ ✓ Log first 10 samples to console                   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
└──────────────────────┬───────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   ALL TESTS COMPLETE         │
        │                              │
        │   ✓ 3/3 tests passed         │
        │   ✓ 14+ screenshots saved    │
        │   ✓ Materials verified       │
        │   ✓ Animation confirmed      │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Generate HTML Report       │
        │   playwright-report/         │
        └──────────────┬───────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │   Display Results            │
        │   Exit with status code      │
        └──────────────────────────────┘
```

## Test Suite Breakdown

### Test 1: Model Loading and Animation Capture

**Purpose:** Comprehensive visual documentation of kart model and animations

**Steps:**
1. Page load and model wait
2. Animation timing capture (4 screenshots)
3. Camera angle capture (6 screenshots)
4. Wheel rotation test (3 screenshots)
5. Scene verification

**Output:**
- 13 screenshots minimum
- Console logs of scene state
- Verification of scene structure

**Duration:** ~45 seconds

### Test 2: Material Verification

**Purpose:** Verify material properties are correctly applied

**Steps:**
1. Page load and model wait
2. Scene graph traversal
3. Material property extraction
4. Analysis and logging

**Output:**
- 1 screenshot (materials-verification.png)
- Console logs of material properties
- Verification of material types

**Duration:** ~15 seconds

### Test 3: Animation Stagger Verification

**Purpose:** Confirm animation is running with proper timing

**Steps:**
1. Page load and model wait
2. Time-series sampling of engine scale
3. Statistical analysis
4. Verification of variation

**Output:**
- Console logs of scale samples
- Scale range calculation
- Animation status confirmation

**Duration:** ~12 seconds

## Screenshot Timeline

```
Time (s)  Action                    Screenshot File
─────────────────────────────────────────────────────────────
0.0       Initial load              01-initial-state-t0s.png
0.5       Wait 500ms                02-engine-compressed-t0.5s.png
1.0       Wait 500ms                03-exhaust1-compressed-t1.0s.png
1.5       Wait 500ms                04-exhaust2-compressed-t1.5s.png
2.0       Orbit left                05-left-side-view.png
3.0       Orbit right               06-right-side-view.png
4.0       Orbit top                 07-top-view.png
5.0       Orbit rear                08-rear-view.png
6.0       Orbit isometric           09-front-isometric-view.png
7.0       Zoom in                   10-closeup-materials.png
8.0       Speed=5, wait             11-wheels-rotating-forward.png
9.0       Speed=-5, wait            12-wheels-rotating-backward.png
10.0      Speed=0, wait             13-final-animation-state.png
11.0      Material test             materials-verification.png
```

## Camera Movement Pattern

```
Start Position: (2.5, 1.2, 2.5)
Looking at: (0, 0.2, 0)

Movement Sequence:
1. Initial → Screenshot 01
2. Left (-300, 0) → Screenshot 05
3. Right (+600, 0) → Screenshot 06
4. Center (-300, 0) → (back to center)
5. Top (0, -300) → Screenshot 07
6. Mid (0, +150) → (return to mid height)
7. Rear (+600, 0) → Screenshot 08
8. Front (-300, 0) → (back to front)
9. Iso (+100, -50) → Screenshot 09
10. Zoom -500 → Screenshot 10
```

## Data Flow

```
┌─────────────┐
│  Test File  │
│    .spec.js │
└──────┬──────┘
       │
       │ imports
       ▼
┌─────────────┐
│  Playwright │
│    Test     │
│   Runner    │
└──────┬──────┘
       │
       │ uses
       ▼
┌─────────────┐      starts      ┌─────────────┐
│   Config    │ ───────────────► │ Vite Server │
│ config.js   │                  │ port 5173   │
└─────────────┘                  └──────┬──────┘
                                        │
                                        │ serves
                                        ▼
                                 ┌─────────────┐
                                 │  index.html │
                                 │  main.js    │
                                 │  Kart App   │
                                 └──────┬──────┘
                                        │
                                        │ loads
                                        ▼
                                 ┌─────────────┐
                                 │  3D Model   │
                                 │  .dae file  │
                                 └──────┬──────┘
                                        │
       ┌────────────────────────────────┘
       │
       │ tests interact with
       ▼
┌─────────────┐      captures    ┌─────────────┐
│  Test       │ ───────────────► │ Screenshots │
│  Execution  │                  │ .temp/      │
└──────┬──────┘                  └─────────────┘
       │
       │ generates
       ▼
┌─────────────┐
│  HTML       │
│  Report     │
└─────────────┘
```

## Key Test Parameters

```javascript
// Timeouts
MODEL_LOAD_TIMEOUT = 30000      // 30 seconds
SERVER_TIMEOUT = 120000         // 120 seconds
TEST_TIMEOUT = 120000           // 120 seconds

// Animation Sampling
SAMPLE_COUNT = 20               // Number of samples
SAMPLE_INTERVAL = 50            // 50ms between samples
SCALE_THRESHOLD = 0.001         // Minimum scale variation

// Camera Movement
ORBIT_STEPS = 20                // Steps per camera move
SETTLE_TIME = 500               // 500ms settle after orbit

// Wheel Testing
FORWARD_SPEED = 5               // Linear velocity forward
BACKWARD_SPEED = -5             // Linear velocity backward
ROTATION_DURATION = 1000        // 1 second per direction

// Screenshot Settings
FORMAT = 'PNG'                  // Image format
FULL_PAGE = false               // Viewport only
PATH = '.temp/screenshots/'     // Output directory
```

## Success Criteria

### Test 1 Success:
- ✓ Model loads within 30 seconds
- ✓ Canvas element is visible
- ✓ 13+ screenshots captured
- ✓ Scene has children (count > 0)
- ✓ No timeout errors

### Test 2 Success:
- ✓ Materials array not empty
- ✓ At least one metallic material (metalness > 0.5)
- ✓ At least one rough material (roughness > 0.8)
- ✓ Screenshot saved
- ✓ Material properties logged

### Test 3 Success:
- ✓ Engine mesh found
- ✓ 20 scale samples collected
- ✓ Scale range > 0.001
- ✓ Scale samples logged
- ✓ Animation confirmed

## File Size Expectations

```
Screenshot Size: 200-500 KB per PNG (depends on content)
Total Screenshots: 14 files × ~350 KB = ~5 MB
HTML Report: 1-2 MB
Test Artifacts: ~10 MB total
```

## Resource Usage

```
CPU: Moderate (rendering + browser automation)
Memory: ~500 MB (Chromium + Node.js)
Disk: ~10 MB (screenshots + reports)
Network: Minimal (local dev server)
```

## Exit Codes

```
0   - All tests passed
1   - One or more tests failed
2   - Configuration error
130 - Interrupted by user (Ctrl+C)
```

## Related Files

- Configuration: `/home/emeric/code/kart/playwright.config.js`
- Test Suite: `/home/emeric/code/kart/tests/kart-visual.spec.js`
- Main App: `/home/emeric/code/kart/main.js`
- Model File: `/home/emeric/code/kart/assets/models/kart/pipeframe64_mario.dae`
- Output Dir: `/home/emeric/code/kart/.temp/screenshots/`

---

**For execution instructions, see INSTRUCTIONS.md**
**For quick reference, see QUICKSTART.md**
**For full documentation, see README.md**
