import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('game-canvas');
let scene, camera, renderer, controls;

window.scene = null;
window.camera = null;
window.renderer = null;
window.controls = null;

function createGroundPlane() {
    const geometry = new THREE.PlaneGeometry(10000, 10000, 200, 200);
    geometry.rotateX(-Math.PI / 2);

    const material = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        roughness: 0.9,
        metalness: 0.1
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    return ground;
}

function createWheel(isRear) {
    const group = new THREE.Group();

    const tireColor = 0x1a1a1a;
    const rimColor = 0xcccccc;

    if (isRear) {
        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.22, 0.22, 0.26, 32),
            new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.95 })
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.14, 0.14, 0.16, 32),
            new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.8, roughness: 0.2 })
        );
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        group.add(rim);
    } else {
        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.18, 0.18, 0.15, 32),
            new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.95 })
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.12, 0.12, 0.09, 32),
            new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.8, roughness: 0.2 })
        );
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        group.add(rim);
    }

    return group;
}

function createKart() {
    const kart = new THREE.Group();

    const white = 0xeeeeee;
    const blue = 0x1a5599;
    const black = 0x0a0a0a;
    const gray = 0x888888;
    const silver = 0xcccccc;

    const frontLeftWheel = createWheel(false);
    frontLeftWheel.position.set(-0.52, 0.18, 0.62);
    kart.add(frontLeftWheel);

    const frontRightWheel = createWheel(false);
    frontRightWheel.position.set(0.52, 0.18, 0.62);
    kart.add(frontRightWheel);

    const rearLeftWheel = createWheel(true);
    rearLeftWheel.position.set(-0.68, 0.22, -0.52);
    kart.add(rearLeftWheel);

    const rearRightWheel = createWheel(true);
    rearRightWheel.position.set(0.68, 0.22, -0.52);
    kart.add(rearRightWheel);

    const floorPan = new THREE.Mesh(
        new THREE.BoxGeometry(0.55, 0.015, 1.20),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.3, roughness: 0.6 })
    );
    floorPan.position.set(0, 0.04, 0);
    floorPan.castShadow = true;
    kart.add(floorPan);

    const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.04, 0.50),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.7 })
    );
    seatBase.position.set(0, 0.08, -0.08);
    seatBase.castShadow = true;
    kart.add(seatBase);

    const seatLeftSide = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.16, 0.45),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.7 })
    );
    seatLeftSide.position.set(-0.165, 0.14, -0.08);
    seatLeftSide.castShadow = true;
    kart.add(seatLeftSide);

    const seatRightSide = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.16, 0.45),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.7 })
    );
    seatRightSide.position.set(0.165, 0.14, -0.08);
    seatRightSide.castShadow = true;
    kart.add(seatRightSide);

    const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.36, 0.28, 0.04),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.7 })
    );
    seatBack.position.set(0, 0.18, -0.31);
    seatBack.rotation.x = -0.15;
    seatBack.castShadow = true;
    kart.add(seatBack);

    const headrest = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.12, 0.06),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.7 })
    );
    headrest.position.set(0, 0.34, -0.32);
    headrest.castShadow = true;
    kart.add(headrest);

    const sidePodLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.10, 0.65),
        new THREE.MeshStandardMaterial({ color: blue, metalness: 0.4, roughness: 0.5 })
    );
    sidePodLeft.position.set(-0.30, 0.09, 0.15);
    sidePodLeft.castShadow = true;
    kart.add(sidePodLeft);

    const sidePodRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.10, 0.65),
        new THREE.MeshStandardMaterial({ color: blue, metalness: 0.4, roughness: 0.5 })
    );
    sidePodRight.position.set(0.30, 0.09, 0.15);
    sidePodRight.castShadow = true;
    kart.add(sidePodRight);

    const noseCone = new THREE.Mesh(
        new THREE.BoxGeometry(0.40, 0.08, 0.18),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.3, roughness: 0.6 })
    );
    noseCone.position.set(0, 0.07, 0.71);
    noseCone.castShadow = true;
    kart.add(noseCone);

    const noseTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.04, 0.12),
        new THREE.MeshStandardMaterial({ color: blue, metalness: 0.4, roughness: 0.5 })
    );
    noseTop.position.set(0, 0.12, 0.70);
    noseTop.castShadow = true;
    kart.add(noseTop);

    const frameLeftMain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 1.40, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameLeftMain.position.set(-0.27, 0.05, 0);
    frameLeftMain.rotation.z = Math.PI / 2;
    frameLeftMain.castShadow = true;
    kart.add(frameLeftMain);

    const frameRightMain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 1.40, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameRightMain.position.set(0.27, 0.05, 0);
    frameRightMain.rotation.z = Math.PI / 2;
    frameRightMain.castShadow = true;
    kart.add(frameRightMain);

    const rollHoopLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.38, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    rollHoopLeft.position.set(-0.18, 0.24, -0.30);
    rollHoopLeft.castShadow = true;
    kart.add(rollHoopLeft);

    const rollHoopRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.38, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    rollHoopRight.position.set(0.18, 0.24, -0.30);
    rollHoopRight.castShadow = true;
    kart.add(rollHoopRight);

    const rollHoopTop = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.36, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    rollHoopTop.position.set(0, 0.43, -0.30);
    rollHoopTop.rotation.z = Math.PI / 2;
    rollHoopTop.castShadow = true;
    kart.add(rollHoopTop);

    const frontBumperBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.90, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frontBumperBar.position.set(0, 0.05, 0.78);
    frontBumperBar.rotation.z = Math.PI / 2;
    frontBumperBar.castShadow = true;
    kart.add(frontBumperBar);

    const rearBumperBar = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 1.20, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    rearBumperBar.position.set(0, 0.12, -0.70);
    rearBumperBar.rotation.z = Math.PI / 2;
    rearBumperBar.castShadow = true;
    kart.add(rearBumperBar);

    const steeringWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.08, 0.012, 12, 32),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.6 })
    );
    steeringWheel.position.set(0, 0.18, 0.25);
    steeringWheel.rotation.x = -0.5;
    steeringWheel.castShadow = true;
    kart.add(steeringWheel);

    const steeringColumn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.20, 8),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    steeringColumn.position.set(0, 0.10, 0.30);
    steeringColumn.rotation.x = 0.5;
    steeringColumn.castShadow = true;
    kart.add(steeringColumn);

    const engineBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.26, 0.22, 0.30),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.5, roughness: 0.6 })
    );
    engineBlock.position.set(0.22, 0.16, -0.60);
    engineBlock.castShadow = true;
    kart.add(engineBlock);

    const engineCylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.06, 0.06, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: 0x4a4a4a, metalness: 0.6, roughness: 0.5 })
    );
    engineCylinder.position.set(0.22, 0.30, -0.60);
    engineCylinder.castShadow = true;
    kart.add(engineCylinder);

    const cylinderHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.07, 0.06, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.5, roughness: 0.6 })
    );
    cylinderHead.position.set(0.22, 0.38, -0.60);
    cylinderHead.castShadow = true;
    kart.add(cylinderHead);

    const exhaustPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.40, 12),
        new THREE.MeshStandardMaterial({ color: 0x606060, metalness: 0.9, roughness: 0.1 })
    );
    exhaustPipe.position.set(0.28, 0.35, -0.50);
    exhaustPipe.rotation.x = Math.PI / 5;
    exhaustPipe.castShadow = true;
    kart.add(exhaustPipe);

    const muffler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.14, 16),
        new THREE.MeshStandardMaterial({ color: 0x606060, metalness: 0.9, roughness: 0.1 })
    );
    muffler.position.set(0.32, 0.48, -0.32);
    muffler.rotation.x = Math.PI / 5;
    muffler.castShadow = true;
    kart.add(muffler);

    const radiator = new THREE.Mesh(
        new THREE.BoxGeometry(0.10, 0.14, 0.06),
        new THREE.MeshStandardMaterial({ color: black, metalness: 0.3, roughness: 0.8 })
    );
    radiator.position.set(-0.20, 0.14, -0.58);
    radiator.castShadow = true;
    kart.add(radiator);

    return kart;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 50, 200);

    camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.set(2.5, 1.2, 2.5);
    camera.lookAt(0, 0.2, 0);

    renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.2, 0);
    controls.minDistance = 1.5;
    controls.maxDistance = 15;

    window.scene = scene;
    window.camera = camera;
    window.renderer = renderer;
    window.controls = controls;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x4a4a4a, 0.5);
    scene.add(hemisphereLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.8);
    sun.position.set(50, 80, 40);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 200;
    sun.shadow.camera.left = -20;
    sun.shadow.camera.right = 20;
    sun.shadow.camera.top = 20;
    sun.shadow.camera.bottom = -20;
    sun.shadow.bias = -0.0001;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0xffffff, 0.8);
    rimLight.position.set(-40, 50, -50);
    scene.add(rimLight);

    const ground = createGroundPlane();
    scene.add(ground);

    const kart = createKart();
    scene.add(kart);

    console.log('Kart Racing Game - Simple Clean Design');

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('resize', onWindowResize);

init();
