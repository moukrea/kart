import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('game-canvas');
let scene, camera, renderer, controls;

function createGroundPlane() {
    const size = 10000;
    const segments = 200;

    const geometry = new THREE.PlaneGeometry(size, size, segments, segments);
    geometry.rotateX(-Math.PI / 2);

    const gridTexture = createGridTexture();

    const material = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.8,
        metalness: 0.2,
        map: gridTexture
    });

    const ground = new THREE.Mesh(geometry, material);
    ground.receiveShadow = true;
    ground.position.y = 0;

    return ground;
}

function createGridTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#2a2a2a';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#404040';
    ctx.lineWidth = 2;

    const gridSize = 50;
    const step = 512 / gridSize;

    for (let i = 0; i <= gridSize; i++) {
        ctx.beginPath();
        ctx.moveTo(i * step, 0);
        ctx.lineTo(i * step, 512);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, i * step);
        ctx.lineTo(512, i * step);
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(100, 100);

    return texture;
}

function createWheel() {
    const wheelGroup = new THREE.Group();

    const tireMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.95,
        metalness: 0.0
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xc0c0c0,
        roughness: 0.3,
        metalness: 0.8
    });

    const tireGeometry = new THREE.TorusGeometry(0.125, 0.04, 16, 32);
    const tire = new THREE.Mesh(tireGeometry, tireMaterial);
    tire.rotation.y = Math.PI / 2;
    tire.castShadow = true;
    tire.receiveShadow = true;

    const rimGeometry = new THREE.CylinderGeometry(0.075, 0.075, 0.05, 32);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.rotation.z = Math.PI / 2;
    rim.castShadow = true;

    wheelGroup.add(tire);
    wheelGroup.add(rim);

    return wheelGroup;
}

function createFrame() {
    const frameGroup = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xc41e3a,
        roughness: 0.3,
        metalness: 0.7
    });

    const tubeRadius = 0.015;
    const segments = 8;

    const leftRail = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.2, segments),
        frameMaterial
    );
    leftRail.rotation.z = Math.PI / 2;
    leftRail.position.set(-0.275, 0.08, 0);
    leftRail.castShadow = true;
    frameGroup.add(leftRail);

    const rightRail = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.2, segments),
        frameMaterial
    );
    rightRail.rotation.z = Math.PI / 2;
    rightRail.position.set(0.275, 0.08, 0);
    rightRail.castShadow = true;
    frameGroup.add(rightRail);

    const frontCross = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.55, segments),
        frameMaterial
    );
    frontCross.rotation.z = Math.PI / 2;
    frontCross.rotation.y = Math.PI / 2;
    frontCross.position.set(0, 0.08, 0.5);
    frontCross.castShadow = true;
    frameGroup.add(frontCross);

    const rearCross = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 1.2, tubeRadius * 1.2, 0.6, segments),
        frameMaterial
    );
    rearCross.rotation.z = Math.PI / 2;
    rearCross.rotation.y = Math.PI / 2;
    rearCross.position.set(0, 0.08, -0.52);
    rearCross.castShadow = true;
    frameGroup.add(rearCross);

    const midCross1 = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 0.9, tubeRadius * 0.9, 0.5, segments),
        frameMaterial
    );
    midCross1.rotation.z = Math.PI / 2;
    midCross1.rotation.y = Math.PI / 2;
    midCross1.position.set(0, 0.08, -0.1);
    midCross1.castShadow = true;
    frameGroup.add(midCross1);

    const rollBarLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 1.1, tubeRadius * 1.1, 0.4, segments),
        frameMaterial
    );
    rollBarLeft.position.set(-0.15, 0.28, -0.15);
    rollBarLeft.castShadow = true;
    frameGroup.add(rollBarLeft);

    const rollBarRight = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 1.1, tubeRadius * 1.1, 0.4, segments),
        frameMaterial
    );
    rollBarRight.position.set(0.15, 0.28, -0.15);
    rollBarRight.castShadow = true;
    frameGroup.add(rollBarRight);

    const rollBarTop = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 1.1, tubeRadius * 1.1, 0.3, segments),
        frameMaterial
    );
    rollBarTop.rotation.z = Math.PI / 2;
    rollBarTop.rotation.y = Math.PI / 2;
    rollBarTop.position.set(0, 0.48, -0.15);
    rollBarTop.castShadow = true;
    frameGroup.add(rollBarTop);

    return frameGroup;
}

function createSeat() {
    const seatGroup = new THREE.Group();

    const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.0
    });

    const baseGeometry = new THREE.BoxGeometry(0.35, 0.05, 0.40);
    const baseMesh = new THREE.Mesh(baseGeometry, seatMaterial);
    baseMesh.position.set(0, 0, 0);
    baseMesh.castShadow = true;
    seatGroup.add(baseMesh);

    const backGeometry = new THREE.BoxGeometry(0.35, 0.4, 0.05);
    const backMesh = new THREE.Mesh(backGeometry, seatMaterial);
    backMesh.position.set(0, 0.15, -0.175);
    backMesh.rotation.x = -0.26;
    backMesh.castShadow = true;
    seatGroup.add(backMesh);

    const bolsterGeometry = new THREE.BoxGeometry(0.05, 0.25, 0.30);

    const leftBolster = new THREE.Mesh(bolsterGeometry, seatMaterial);
    leftBolster.position.set(-0.18, 0.08, -0.05);
    leftBolster.rotation.x = -0.175;
    leftBolster.castShadow = true;
    seatGroup.add(leftBolster);

    const rightBolster = new THREE.Mesh(bolsterGeometry, seatMaterial);
    rightBolster.position.set(0.18, 0.08, -0.05);
    rightBolster.rotation.x = -0.175;
    rightBolster.castShadow = true;
    seatGroup.add(rightBolster);

    seatGroup.position.set(0, 0.15, -0.1);

    return seatGroup;
}

function createSteeringWheel() {
    const wheelGroup = new THREE.Group();

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.0
    });

    const spokeMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.4,
        metalness: 0.6
    });

    const hubMaterial = new THREE.MeshStandardMaterial({
        color: 0x333333,
        roughness: 0.3,
        metalness: 0.7
    });

    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.2,
        metalness: 0.8
    });

    const rimGeometry = new THREE.TorusGeometry(0.14, 0.012, 16, 32);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.castShadow = true;
    wheelGroup.add(rim);

    const spokeGeometry = new THREE.CylinderGeometry(0.006, 0.006, 0.12, 8);
    const spokeCount = 3;

    for (let i = 0; i < spokeCount; i++) {
        const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
        const angle = (i / spokeCount) * Math.PI * 2;
        const distance = 0.07;

        spoke.position.x = Math.cos(angle) * distance;
        spoke.position.z = Math.sin(angle) * distance;
        spoke.rotation.z = -angle;
        spoke.rotation.x = Math.PI / 2;
        spoke.castShadow = true;

        wheelGroup.add(spoke);
    }

    const hubGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.025, 32);
    const hub = new THREE.Mesh(hubGeometry, hubMaterial);
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    wheelGroup.add(hub);

    const columnGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12);
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = -0.125;
    column.castShadow = true;
    wheelGroup.add(column);

    wheelGroup.position.set(0, 0.42, 0.25);
    wheelGroup.rotation.x = -0.44;

    return wheelGroup;
}

function createPedals() {
    const pedalGroup = new THREE.Group();

    const mountMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.8,
        roughness: 0.3
    });

    const gasPedalMaterial = new THREE.MeshStandardMaterial({
        color: 0x4a4a4a,
        metalness: 0.6,
        roughness: 0.4
    });

    const brakePedalMaterial = new THREE.MeshStandardMaterial({
        color: 0x8b0000,
        metalness: 0.5,
        roughness: 0.5
    });

    const mount = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, 0.015, 0.015),
        mountMaterial
    );
    mount.castShadow = true;
    pedalGroup.add(mount);

    const gasPedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, 0.08, 0.01),
        gasPedalMaterial
    );
    gasPedal.position.set(0.08, -0.08, 0.04);
    gasPedal.rotation.x = 0.52;
    gasPedal.castShadow = true;
    pedalGroup.add(gasPedal);

    const brakePedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.07, 0.1, 0.01),
        brakePedalMaterial
    );
    brakePedal.position.set(-0.08, -0.08, 0.04);
    brakePedal.rotation.x = 0.52;
    brakePedal.castShadow = true;
    pedalGroup.add(brakePedal);

    pedalGroup.position.set(0, 0.08, 0.45);

    return pedalGroup;
}

function createKart() {
    const kartGroup = new THREE.Group();

    const frame = createFrame();
    kartGroup.add(frame);

    const frontLeftWheel = createWheel();
    frontLeftWheel.position.set(-0.275, 0.125, 0.52);
    kartGroup.add(frontLeftWheel);

    const frontRightWheel = createWheel();
    frontRightWheel.position.set(0.275, 0.125, 0.52);
    kartGroup.add(frontRightWheel);

    const rearLeftWheel = createWheel();
    rearLeftWheel.position.set(-0.288, 0.125, -0.52);
    kartGroup.add(rearLeftWheel);

    const rearRightWheel = createWheel();
    rearRightWheel.position.set(0.288, 0.125, -0.52);
    kartGroup.add(rearRightWheel);

    const seat = createSeat();
    kartGroup.add(seat);

    const steeringWheel = createSteeringWheel();
    kartGroup.add(steeringWheel);

    const pedals = createPedals();
    kartGroup.add(pedals);

    return kartGroup;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x87ceeb);
    scene.fog = new THREE.Fog(0x87ceeb, 100, 500);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(3, 2, 4);
    camera.lookAt(0, 0.5, 0);

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
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
    controls.target.set(0, 0.3, 0);
    controls.minDistance = 1.5;
    controls.maxDistance = 20;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0x87ceeb, 0x8b7355, 0.3);
    scene.add(hemisphereLight);

    const sun = new THREE.DirectionalLight(0xffffff, 1.2);
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

    const rimLight = new THREE.DirectionalLight(0xfff5e6, 0.5);
    rimLight.position.set(-40, 60, -50);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe6f2ff, 0.3);
    fillLight.position.set(0, -20, 30);
    scene.add(fillLight);

    const ground = createGroundPlane();
    scene.add(ground);

    const kart = createKart();
    scene.add(kart);

    console.log('3D Kart Racing Game Initialized');
    console.log('Ground: 10km x 10km plane');
    console.log('Kart components: Frame, Wheels (torus-based), Seat, Steering, Pedals');
    console.log('Controls: Drag to rotate, Scroll to zoom');

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
