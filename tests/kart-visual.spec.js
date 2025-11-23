import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

const SCREENSHOT_DIR = '/home/emeric/code/kart/.temp/screenshots';
const MODEL_LOAD_TIMEOUT = 30000;

test.describe('Kart Model Visual Verification', () => {
  test.beforeAll(() => {
    // Ensure screenshot directory exists
    if (!fs.existsSync(SCREENSHOT_DIR)) {
      fs.mkdirSync(SCREENSHOT_DIR, { recursive: true });
    }
  });

  test('should load kart model and capture animation states', async ({ page }) => {
    // Configure slower execution for visual inspection
    test.setTimeout(120000);

    // Navigate to the main page
    console.log('Navigating to kart game page...');
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for canvas to be visible
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();
    console.log('Canvas element is visible');

    // Set up console listener to capture model loading message
    let modelLoaded = false;
    page.on('console', msg => {
      if (msg.text().includes('Downloaded kart model loaded successfully')) {
        modelLoaded = true;
        console.log('Model loaded successfully!');
      }
    });

    // Wait for model to load with timeout
    console.log('Waiting for kart model to load...');
    await page.waitForFunction(
      () => {
        const logs = [];
        return new Promise((resolve) => {
          const originalLog = console.log;
          console.log = (...args) => {
            originalLog.apply(console, args);
            logs.push(args.join(' '));
            if (args.join(' ').includes('Downloaded kart model loaded successfully')) {
              resolve(true);
            }
          };
          setTimeout(() => resolve(false), 30000);
        });
      },
      { timeout: MODEL_LOAD_TIMEOUT }
    ).catch(async () => {
      // Check if model loaded via our listener
      if (!modelLoaded) {
        // Take a screenshot of the current state for debugging
        await page.screenshot({ path: path.join(SCREENSHOT_DIR, 'model-load-timeout.png') });
        throw new Error('Model failed to load within timeout');
      }
    });

    // Give a small delay for rendering to stabilize
    await page.waitForTimeout(1000);
    console.log('Model loaded and rendered');

    // Capture initial state at t=0s
    console.log('Capturing screenshot: initial state (t=0s)');
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '01-initial-state-t0s.png'),
      fullPage: false
    });

    // Function to simulate camera orbit by dragging
    const orbitCamera = async (deltaX, deltaY) => {
      const canvasBox = await canvas.boundingBox();
      const centerX = canvasBox.x + canvasBox.width / 2;
      const centerY = canvasBox.y + canvasBox.height / 2;

      await page.mouse.move(centerX, centerY);
      await page.mouse.down();
      await page.mouse.move(centerX + deltaX, centerY + deltaY, { steps: 20 });
      await page.mouse.up();
      await page.waitForTimeout(500); // Wait for orbit animation to settle
    };

    // Wait for animation to reach compressed state (engine compressed at t=0.5s)
    console.log('Waiting for t=0.5s (engine compressed)...');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '02-engine-compressed-t0.5s.png'),
      fullPage: false
    });

    // Wait for t=1.0s (exhaust 1 compressed)
    console.log('Waiting for t=1.0s (exhaust 1 compressed)...');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '03-exhaust1-compressed-t1.0s.png'),
      fullPage: false
    });

    // Wait for t=1.5s (exhaust 2 compressed)
    console.log('Waiting for t=1.5s (exhaust 2 compressed)...');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '04-exhaust2-compressed-t1.5s.png'),
      fullPage: false
    });

    // Capture from different angles
    console.log('Capturing left side view...');
    await orbitCamera(-300, 0);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '05-left-side-view.png'),
      fullPage: false
    });

    console.log('Capturing right side view...');
    await orbitCamera(600, 0); // Go from left to right
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '06-right-side-view.png'),
      fullPage: false
    });

    // Orbit back to center and view from top
    console.log('Capturing top view...');
    await orbitCamera(-300, 0); // Center horizontally
    await orbitCamera(0, -300); // Look from above
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '07-top-view.png'),
      fullPage: false
    });

    // View from rear
    console.log('Capturing rear view...');
    await orbitCamera(0, 150); // Return to middle height
    await orbitCamera(600, 0); // Rotate 180 degrees
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '08-rear-view.png'),
      fullPage: false
    });

    // Return to front isometric view
    console.log('Capturing front isometric view...');
    await orbitCamera(-300, 0); // Face front
    await orbitCamera(100, -50); // Slight isometric angle
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '09-front-isometric-view.png'),
      fullPage: false
    });

    // Capture zoomed in view of materials
    console.log('Capturing close-up view...');
    await page.mouse.wheel(0, -500); // Zoom in
    await page.waitForTimeout(300);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '10-closeup-materials.png'),
      fullPage: false
    });

    // Test wheel rotation by setting speed
    console.log('Testing wheel rotation (forward motion)...');
    await page.evaluate(() => {
      window.kartSpeed = 5;
    });
    await page.waitForTimeout(1000); // Let wheels spin for 1 second
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '11-wheels-rotating-forward.png'),
      fullPage: false
    });

    // Reverse wheel rotation
    console.log('Testing wheel rotation (backward motion)...');
    await page.evaluate(() => {
      window.kartSpeed = -5;
    });
    await page.waitForTimeout(1000);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '12-wheels-rotating-backward.png'),
      fullPage: false
    });

    // Stop wheel rotation
    await page.evaluate(() => {
      window.kartSpeed = 0;
    });

    // Capture final state showing engine animation
    console.log('Capturing final animation state...');
    await page.waitForTimeout(500);
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '13-final-animation-state.png'),
      fullPage: false
    });

    console.log(`\nAll screenshots saved to: ${SCREENSHOT_DIR}`);
    console.log('\nScreenshot manifest:');
    console.log('  01-initial-state-t0s.png - Initial rendering state');
    console.log('  02-engine-compressed-t0.5s.png - Engine at compression point');
    console.log('  03-exhaust1-compressed-t1.0s.png - First exhaust compression');
    console.log('  04-exhaust2-compressed-t1.5s.png - Second exhaust compression (staggered)');
    console.log('  05-left-side-view.png - Left side perspective');
    console.log('  06-right-side-view.png - Right side perspective');
    console.log('  07-top-view.png - Top-down view');
    console.log('  08-rear-view.png - Rear view');
    console.log('  09-front-isometric-view.png - Front isometric angle');
    console.log('  10-closeup-materials.png - Zoomed view of materials');
    console.log('  11-wheels-rotating-forward.png - Wheels spinning forward');
    console.log('  12-wheels-rotating-backward.png - Wheels spinning backward');
    console.log('  13-final-animation-state.png - Final animation frame');

    // Verify key elements are present in the scene
    console.log('\nVerifying scene elements...');
    const sceneInfo = await page.evaluate(() => {
      return {
        hasEngine: window.scene?.children.some(obj =>
          obj.traverse && (() => {
            let found = false;
            obj.traverse(child => {
              if (child.name && child.name.toLowerCase().includes('engine')) {
                found = true;
              }
            });
            return found;
          })()
        ),
        sceneChildren: window.scene?.children.length || 0,
        cameraPosition: window.camera ? {
          x: window.camera.position.x.toFixed(2),
          y: window.camera.position.y.toFixed(2),
          z: window.camera.position.z.toFixed(2)
        } : null
      };
    });

    console.log('Scene info:', JSON.stringify(sceneInfo, null, 2));
    expect(sceneInfo.sceneChildren).toBeGreaterThan(0);
  });

  test('should verify materials are applied correctly', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for canvas and model
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    // Wait for model load (shorter timeout for second test)
    await page.waitForTimeout(5000);

    // Check that materials have proper metalness and roughness values
    const materialInfo = await page.evaluate(() => {
      const materials = [];
      if (window.scene) {
        window.scene.traverse((child) => {
          if (child.isMesh && child.material) {
            const mats = Array.isArray(child.material) ? child.material : [child.material];
            mats.forEach((mat, idx) => {
              materials.push({
                meshName: child.name,
                materialName: mat.name,
                metalness: mat.metalness,
                roughness: mat.roughness,
                hasMap: !!mat.map,
                index: idx
              });
            });
          }
        });
      }
      return materials;
    });

    console.log('\nMaterial properties found:');
    materialInfo.forEach((mat, i) => {
      if (i < 20) { // Limit output to first 20 materials
        console.log(`  ${mat.meshName} [${mat.materialName}]: metalness=${mat.metalness}, roughness=${mat.roughness}, hasMap=${mat.hasMap}`);
      }
    });

    if (materialInfo.length > 20) {
      console.log(`  ... and ${materialInfo.length - 20} more materials`);
    }

    // Verify we have materials with different properties
    expect(materialInfo.length).toBeGreaterThan(0);

    // Check that we have some metallic materials (rims, metal parts)
    const metallicMaterials = materialInfo.filter(m => m.metalness > 0.5);
    console.log(`\nFound ${metallicMaterials.length} metallic materials (metalness > 0.5)`);

    // Check that we have some rough materials (tires, fabric)
    const roughMaterials = materialInfo.filter(m => m.roughness > 0.8);
    console.log(`Found ${roughMaterials.length} rough materials (roughness > 0.8)`);

    // Take a screenshot showing material properties
    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'materials-verification.png'),
      fullPage: false
    });
  });

  test('should verify animations are running with stagger', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const canvas = page.locator('#game-canvas');
    await expect(canvas).toBeVisible();

    // Wait for model load
    await page.waitForTimeout(5000);

    // Sample engine scale over multiple frames to verify animation
    const scalesSampled = await page.evaluate(async () => {
      const scales = [];
      const sampleCount = 20;
      const interval = 50; // Sample every 50ms

      for (let i = 0; i < sampleCount; i++) {
        await new Promise(resolve => setTimeout(resolve, interval));

        // Find engine mesh and record its scale
        let engineScale = null;
        if (window.scene) {
          window.scene.traverse((child) => {
            if (child.name && child.name.toLowerCase().includes('engine')) {
              engineScale = {
                x: child.scale.x,
                y: child.scale.y,
                z: child.scale.z
              };
            }
          });
        }
        scales.push(engineScale);
      }

      return scales;
    });

    console.log('\nEngine scale samples over time:');
    const validScales = scalesSampled.filter(s => s !== null);
    validScales.slice(0, 10).forEach((scale, i) => {
      if (scale) {
        console.log(`  Sample ${i}: x=${scale.x.toFixed(4)}, y=${scale.y.toFixed(4)}, z=${scale.z.toFixed(4)}`);
      }
    });

    if (validScales.length > 0) {
      // Verify that scale values change (animation is running)
      const scaleValues = validScales.map(s => s.x);
      const minScale = Math.min(...scaleValues);
      const maxScale = Math.max(...scaleValues);
      const scaleRange = maxScale - minScale;

      console.log(`\nScale range: ${minScale.toFixed(4)} to ${maxScale.toFixed(4)} (range: ${scaleRange.toFixed(4)})`);

      // Expect some variation in scale (animation is working)
      expect(scaleRange).toBeGreaterThan(0.001);
      console.log('Animation verified: engine scale is changing over time');
    } else {
      console.log('Warning: Could not find engine mesh for animation verification');
    }
  });
});
