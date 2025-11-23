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
            new THREE.CylinderGeometry(0.16, 0.16, 0.20, 32),
            new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.95 })
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.11, 0.11, 0.12, 32),
            new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.8, roughness: 0.2 })
        );
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        group.add(rim);
    } else {
        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.145, 0.145, 0.13, 32),
            new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.95 })
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.105, 0.105, 0.08, 32),
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

    const red = 0xdd2222;
    const black = 0x0a0a0a;
    const gray = 0x3a3a3a;

    const frontLeftWheel = createWheel(false);
    frontLeftWheel.position.set(-0.55, 0.145, 0.50);
    kart.add(frontLeftWheel);

    const frontRightWheel = createWheel(false);
    frontRightWheel.position.set(0.55, 0.145, 0.50);
    kart.add(frontRightWheel);

    const rearLeftWheel = createWheel(true);
    rearLeftWheel.position.set(-0.60, 0.16, -0.50);
    kart.add(rearLeftWheel);

    const rearRightWheel = createWheel(true);
    rearRightWheel.position.set(0.60, 0.16, -0.50);
    kart.add(rearRightWheel);

    const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.70, 0.03, 1.05),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    chassis.position.set(0, 0.06, 0);
    chassis.castShadow = true;
    kart.add(chassis);

    const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.40, 0.04, 0.45),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.8 })
    );
    seatBase.position.set(0, 0.09, -0.12);
    seatBase.castShadow = true;
    kart.add(seatBase);

    const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.40, 0.30, 0.05),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.8 })
    );
    seatBack.position.set(0, 0.22, -0.32);
    seatBack.rotation.x = -0.3;
    seatBack.castShadow = true;
    kart.add(seatBack);

    const nose = new THREE.Mesh(
        new THREE.BoxGeometry(0.50, 0.12, 0.25),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    nose.position.set(0, 0.10, 0.62);
    nose.castShadow = true;
    kart.add(nose);

    const frontBumper = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.04, 0.05),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    frontBumper.position.set(0, 0.06, 0.72);
    frontBumper.castShadow = true;
    kart.add(frontBumper);

    const sidePodLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.10, 0.50),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    sidePodLeft.position.set(-0.38, 0.10, 0.05);
    sidePodLeft.castShadow = true;
    kart.add(sidePodLeft);

    const sidePodRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.10, 0.50),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    sidePodRight.position.set(0.38, 0.10, 0.05);
    sidePodRight.castShadow = true;
    kart.add(sidePodRight);

    const steeringWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.10, 0.012, 12, 32),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.7 })
    );
    steeringWheel.position.set(0, 0.20, 0.10);
    steeringWheel.rotation.x = -0.6;
    steeringWheel.castShadow = true;
    kart.add(steeringWheel);

    const steeringColumn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.010, 0.010, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.7, roughness: 0.3 })
    );
    steeringColumn.position.set(0, 0.13, 0.15);
    steeringColumn.rotation.x = 0.6;
    steeringColumn.castShadow = true;
    kart.add(steeringColumn);

    const engineBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.28, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5, roughness: 0.7 })
    );
    engineBlock.position.set(0.18, 0.21, -0.60);
    engineBlock.castShadow = true;
    kart.add(engineBlock);

    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.6, roughness: 0.6 })
    );
    cylinder.position.set(0.18, 0.34, -0.60);
    cylinder.castShadow = true;
    kart.add(cylinder);

    const cylinderHead = new THREE.Mesh(
        new THREE.CylinderGeometry(0.065, 0.055, 0.04, 16),
        new THREE.MeshStandardMaterial({ color: 0x2a2a2a, metalness: 0.5, roughness: 0.7 })
    );
    cylinderHead.position.set(0.18, 0.405, -0.60);
    cylinderHead.castShadow = true;
    kart.add(cylinderHead);

    const exhaustPipe = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.35, 12),
        new THREE.MeshStandardMaterial({ color: 0x505050, metalness: 0.9, roughness: 0.15 })
    );
    exhaustPipe.position.set(0.22, 0.38, -0.52);
    exhaustPipe.rotation.x = Math.PI / 6;
    exhaustPipe.castShadow = true;
    kart.add(exhaustPipe);

    const muffler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16),
        new THREE.MeshStandardMaterial({ color: 0x505050, metalness: 0.9, roughness: 0.15 })
    );
    muffler.position.set(0.24, 0.48, -0.38);
    muffler.rotation.x = Math.PI / 6;
    muffler.castShadow = true;
    kart.add(muffler);

    const rearBumper = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.04, 0.05),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    rearBumper.position.set(0, 0.12, -0.72);
    rearBumper.castShadow = true;
    kart.add(rearBumper);

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
