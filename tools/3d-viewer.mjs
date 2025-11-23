import { chromium } from 'playwright';
import { spawn } from 'child_process';
import { setTimeout } from 'timers/promises';

const VIEWS = [
  {
    name: 'perspective',
    camera: 'camera.position.set(2.5, 1.2, 2.5); camera.lookAt(0, 0.2, 0);',
    description: 'Three-quarter view'
  },
  {
    name: 'front',
    camera: 'camera.position.set(0, 0.3, 3); camera.lookAt(0, 0.3, 0);',
    description: 'Front view'
  },
  {
    name: 'back',
    camera: 'camera.position.set(0, 0.3, -3); camera.lookAt(0, 0.3, 0);',
    description: 'Rear view'
  },
  {
    name: 'left',
    camera: 'camera.position.set(-3, 0.3, 0); camera.lookAt(0, 0.3, 0);',
    description: 'Left side view'
  },
  {
    name: 'right',
    camera: 'camera.position.set(3, 0.3, 0); camera.lookAt(0, 0.3, 0);',
    description: 'Right side view'
  },
  {
    name: 'top',
    camera: 'camera.position.set(0, 4, 0.001); camera.lookAt(0, 0, 0);',
    description: 'Top-down view'
  },
  {
    name: 'bottom',
    camera: 'camera.position.set(0, -2, 0.001); camera.lookAt(0, 0, 0);',
    description: 'Bottom view'
  }
];

async function captureModelViews() {
  console.log('Starting dev server...');

  const devServer = spawn('npm', ['run', 'dev'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    shell: true
  });

  let ready = false;
  devServer.stdout.on('data', (d) => {
    if (d.toString().includes('Local:')) ready = true;
  });

  while (!ready) await setTimeout(100);
  await setTimeout(2000);

  console.log('Dev server ready, launching browser...');

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1920, height: 1080 }
  });
  const page = await context.newPage();

  await page.goto('http://localhost:5173');
  await setTimeout(2000);

  console.log('\nCapturing views...\n');

  for (const view of VIEWS) {
    try {
      await page.evaluate((cameraCode) => {
        eval(cameraCode);
        controls.update();
        renderer.render(scene, camera);
      }, view.camera);

      await setTimeout(300);

      const filename = `.temp/view-${view.name}.png`;
      await page.screenshot({ path: filename });

      console.log(`✓ ${view.description.padEnd(20)} -> ${filename}`);
    } catch (error) {
      console.error(`✗ Failed to capture ${view.name}:`, error.message);
    }
  }

  await browser.close();
  devServer.kill();

  console.log('\n✓ All views captured in .temp/');
  console.log('\nViews available:');
  VIEWS.forEach(v => console.log(`  - ${v.name}: ${v.description}`));
}

captureModelViews().catch(console.error);
