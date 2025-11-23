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
            new THREE.CylinderGeometry(0.14, 0.14, 0.18, 32),
            new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.95 })
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.10, 0.10, 0.10, 32),
            new THREE.MeshStandardMaterial({ color: rimColor, metalness: 0.8, roughness: 0.2 })
        );
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        group.add(rim);
    } else {
        const tire = new THREE.Mesh(
            new THREE.CylinderGeometry(0.127, 0.127, 0.11, 32),
            new THREE.MeshStandardMaterial({ color: tireColor, roughness: 0.95 })
        );
        tire.rotation.z = Math.PI / 2;
        tire.castShadow = true;
        group.add(tire);

        const rim = new THREE.Mesh(
            new THREE.CylinderGeometry(0.095, 0.095, 0.065, 32),
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
    frontLeftWheel.position.set(-0.55, 0.127, 0.50);
    kart.add(frontLeftWheel);

    const frontRightWheel = createWheel(false);
    frontRightWheel.position.set(0.55, 0.127, 0.50);
    kart.add(frontRightWheel);

    const rearLeftWheel = createWheel(true);
    rearLeftWheel.position.set(-0.60, 0.14, -0.50);
    kart.add(rearLeftWheel);

    const rearRightWheel = createWheel(true);
    rearRightWheel.position.set(0.60, 0.14, -0.50);
    kart.add(rearRightWheel);

    const chassis = new THREE.Mesh(
        new THREE.BoxGeometry(0.60, 0.05, 1.20),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    chassis.position.set(0, 0.08, -0.05);
    chassis.castShadow = true;
    kart.add(chassis);

    const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.50),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.8 })
    );
    seatBase.position.set(0, 0.15, -0.15);
    seatBase.castShadow = true;
    kart.add(seatBase);

    const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.45, 0.08),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.8 })
    );
    seatBack.position.set(0, 0.34, -0.38);
    seatBack.rotation.x = -0.2;
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
        new THREE.BoxGeometry(0.12, 0.15, 0.60),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    sidePodLeft.position.set(-0.42, 0.12, 0.05);
    sidePodLeft.castShadow = true;
    kart.add(sidePodLeft);

    const sidePodRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, 0.15, 0.60),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    sidePodRight.position.set(0.42, 0.12, 0.05);
    sidePodRight.castShadow = true;
    kart.add(sidePodRight);

    const rearWing = new THREE.Mesh(
        new THREE.BoxGeometry(0.90, 0.03, 0.18),
        new THREE.MeshStandardMaterial({ color: red, metalness: 0.6, roughness: 0.4 })
    );
    rearWing.position.set(0, 0.38, -0.58);
    rearWing.castShadow = true;
    kart.add(rearWing);

    const wingStrutLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.20, 0.03),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.7, roughness: 0.3 })
    );
    wingStrutLeft.position.set(-0.38, 0.28, -0.58);
    wingStrutLeft.castShadow = true;
    kart.add(wingStrutLeft);

    const wingStrutRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.20, 0.03),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.7, roughness: 0.3 })
    );
    wingStrutRight.position.set(0.38, 0.28, -0.58);
    wingStrutRight.castShadow = true;
    kart.add(wingStrutRight);

    const steeringWheel = new THREE.Mesh(
        new THREE.TorusGeometry(0.12, 0.015, 12, 32),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.7 })
    );
    steeringWheel.position.set(0, 0.32, 0.05);
    steeringWheel.rotation.x = -0.5;
    steeringWheel.castShadow = true;
    kart.add(steeringWheel);

    const steeringColumn = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.20, 8),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.7, roughness: 0.3 })
    );
    steeringColumn.position.set(0, 0.22, 0.10);
    steeringColumn.rotation.x = 0.5;
    steeringColumn.castShadow = true;
    kart.add(steeringColumn);

    const engineBlock = new THREE.Mesh(
        new THREE.BoxGeometry(0.28, 0.35, 0.30),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.5, roughness: 0.6 })
    );
    engineBlock.position.set(0, 0.25, -0.65);
    engineBlock.castShadow = true;
    kart.add(engineBlock);

    const exhaust = new THREE.Mesh(
        new THREE.CylinderGeometry(0.035, 0.035, 0.45, 16),
        new THREE.MeshStandardMaterial({ color: 0x606060, metalness: 0.9, roughness: 0.2 })
    );
    exhaust.position.set(0.18, 0.48, -0.65);
    exhaust.rotation.x = -0.3;
    exhaust.castShadow = true;
    kart.add(exhaust);

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
