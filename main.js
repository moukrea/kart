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
        color: 0xa0a0a0,
        roughness: 0.9,
        metalness: 0.1,
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

    ctx.fillStyle = '#909090';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#b0b0b0';
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

function createWheel(isFront) {
    const wheelGroup = new THREE.Group();

    const tireMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.95,
        metalness: 0.0
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xcccccc,
        roughness: 0.25,
        metalness: 0.85
    });

    if (isFront) {
        const tireRadius = 0.127;
        const tireWidth = 0.057;

        const tireGeometry = new THREE.TorusGeometry(tireRadius, tireWidth, 16, 32);
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        tire.receiveShadow = true;
        wheelGroup.add(tire);

        const rimGeometry = new THREE.CylinderGeometry(0.095, 0.095, 0.065, 24);
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        wheelGroup.add(rim);
    } else {
        const tireRadius = 0.140;
        const tireWidth = 0.090;

        const tireGeometry = new THREE.TorusGeometry(tireRadius, tireWidth, 16, 32);
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        tire.receiveShadow = true;
        wheelGroup.add(tire);

        const rimGeometry = new THREE.CylinderGeometry(0.105, 0.105, 0.090, 24);
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        wheelGroup.add(rim);
    }

    return wheelGroup;
}

function createFrame() {
    const frameGroup = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xd42020,
        roughness: 0.3,
        metalness: 0.7
    });

    const tubeRadius = 0.016;

    const leftRail = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.05, 8),
        frameMaterial
    );
    leftRail.rotation.z = Math.PI / 2;
    leftRail.position.set(-0.35, 0.08, 0);
    leftRail.castShadow = true;
    frameGroup.add(leftRail);

    const rightRail = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 1.05, 8),
        frameMaterial
    );
    rightRail.rotation.z = Math.PI / 2;
    rightRail.position.set(0.35, 0.08, 0);
    rightRail.castShadow = true;
    frameGroup.add(rightRail);

    const frontCross = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.70, 8),
        frameMaterial
    );
    frontCross.rotation.z = Math.PI / 2;
    frontCross.rotation.y = Math.PI / 2;
    frontCross.position.set(0, 0.08, 0.525);
    frontCross.castShadow = true;
    frameGroup.add(frontCross);

    const rearCross = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.70, 8),
        frameMaterial
    );
    rearCross.rotation.z = Math.PI / 2;
    rearCross.rotation.y = Math.PI / 2;
    rearCross.position.set(0, 0.08, -0.525);
    rearCross.castShadow = true;
    frameGroup.add(rearCross);

    const middleCross1 = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.70, 8),
        frameMaterial
    );
    middleCross1.rotation.z = Math.PI / 2;
    middleCross1.rotation.y = Math.PI / 2;
    middleCross1.position.set(0, 0.08, 0.18);
    middleCross1.castShadow = true;
    frameGroup.add(middleCross1);

    const middleCross2 = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.70, 8),
        frameMaterial
    );
    middleCross2.rotation.z = Math.PI / 2;
    middleCross2.rotation.y = Math.PI / 2;
    middleCross2.position.set(0, 0.08, -0.18);
    middleCross2.castShadow = true;
    frameGroup.add(middleCross2);

    const rollBarLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.35, 8),
        frameMaterial
    );
    rollBarLeft.position.set(-0.18, 0.255, -0.18);
    rollBarLeft.castShadow = true;
    frameGroup.add(rollBarLeft);

    const rollBarRight = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.35, 8),
        frameMaterial
    );
    rollBarRight.position.set(0.18, 0.255, -0.18);
    rollBarRight.castShadow = true;
    frameGroup.add(rollBarRight);

    const rollBarTop = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius, tubeRadius, 0.36, 8),
        frameMaterial
    );
    rollBarTop.rotation.z = Math.PI / 2;
    rollBarTop.rotation.y = Math.PI / 2;
    rollBarTop.position.set(0, 0.43, -0.18);
    rollBarTop.castShadow = true;
    frameGroup.add(rollBarTop);

    const frontBumper = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 1.2, tubeRadius * 1.2, 1.0, 8),
        frameMaterial
    );
    frontBumper.rotation.z = Math.PI / 2;
    frontBumper.rotation.y = Math.PI / 2;
    frontBumper.position.set(0, 0.05, 0.56);
    frontBumper.castShadow = true;
    frameGroup.add(frontBumper);

    const rearBumper = new THREE.Mesh(
        new THREE.CylinderGeometry(tubeRadius * 1.2, tubeRadius * 1.2, 1.15, 8),
        frameMaterial
    );
    rearBumper.rotation.z = Math.PI / 2;
    rearBumper.rotation.y = Math.PI / 2;
    rearBumper.position.set(0, 0.05, -0.56);
    rearBumper.castShadow = true;
    frameGroup.add(rearBumper);

    return frameGroup;
}

function createSeat() {
    const seatGroup = new THREE.Group();

    const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0x0a0a0a,
        roughness: 0.8,
        metalness: 0.1
    });

    const base = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.08, 0.50),
        seatMaterial
    );
    base.castShadow = true;
    seatGroup.add(base);

    const back = new THREE.Mesh(
        new THREE.BoxGeometry(0.45, 0.40, 0.08),
        seatMaterial
    );
    back.position.set(0, 0.18, -0.21);
    back.rotation.x = -0.35;
    back.castShadow = true;
    seatGroup.add(back);

    const leftBolster = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.25, 0.35),
        seatMaterial
    );
    leftBolster.position.set(-0.22, 0.08, -0.08);
    leftBolster.castShadow = true;
    seatGroup.add(leftBolster);

    const rightBolster = new THREE.Mesh(
        new THREE.BoxGeometry(0.09, 0.25, 0.35),
        seatMaterial
    );
    rightBolster.position.set(0.22, 0.08, -0.08);
    rightBolster.castShadow = true;
    seatGroup.add(rightBolster);

    seatGroup.position.set(0, 0.12, -0.30);

    return seatGroup;
}

function createSteeringWheel() {
    const wheelGroup = new THREE.Group();

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.2
    });

    const spokeMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.3,
        metalness: 0.8
    });

    const rim = new THREE.Mesh(
        new THREE.TorusGeometry(0.16, 0.018, 12, 32),
        rimMaterial
    );
    rim.castShadow = true;
    wheelGroup.add(rim);

    for (let i = 0; i < 3; i++) {
        const spoke = new THREE.Mesh(
            new THREE.BoxGeometry(0.010, 0.16, 0.030),
            spokeMaterial
        );
        spoke.rotation.z = (i / 3) * Math.PI * 2;
        spoke.castShadow = true;
        wheelGroup.add(spoke);
    }

    const hub = new THREE.Mesh(
        new THREE.CylinderGeometry(0.040, 0.040, 0.035, 24),
        spokeMaterial
    );
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    wheelGroup.add(hub);

    const column = new THREE.Mesh(
        new THREE.CylinderGeometry(0.012, 0.012, 0.35, 12),
        spokeMaterial
    );
    column.position.y = -0.175;
    column.castShadow = true;
    wheelGroup.add(column);

    wheelGroup.position.set(0, 0.38, 0.55);
    wheelGroup.rotation.x = -0.40;

    return wheelGroup;
}

function createEngine() {
    const engineGroup = new THREE.Group();

    const engineMaterial = new THREE.MeshStandardMaterial({
        color: 0x303030,
        roughness: 0.5,
        metalness: 0.6
    });

    const finMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.4,
        metalness: 0.7
    });

    const block = new THREE.Mesh(
        new THREE.BoxGeometry(0.25, 0.30, 0.28),
        engineMaterial
    );
    block.castShadow = true;
    engineGroup.add(block);

    const cylinder = new THREE.Mesh(
        new THREE.CylinderGeometry(0.055, 0.055, 0.15, 16),
        finMaterial
    );
    cylinder.position.set(0, 0.18, 0);
    cylinder.castShadow = true;
    engineGroup.add(cylinder);

    for (let i = 0; i < 8; i++) {
        const fin = new THREE.Mesh(
            new THREE.CylinderGeometry(0.065, 0.065, 0.008, 16),
            finMaterial
        );
        fin.position.set(0, 0.18 + (i - 4) * 0.015, 0);
        fin.castShadow = true;
        engineGroup.add(fin);
    }

    const head = new THREE.Mesh(
        new THREE.CylinderGeometry(0.070, 0.060, 0.08, 16),
        engineMaterial
    );
    head.position.set(0, 0.285, 0);
    head.castShadow = true;
    engineGroup.add(head);

    engineGroup.position.set(0.35, 0.22, -0.85);

    return engineGroup;
}

function createExhaust() {
    const exhaustGroup = new THREE.Group();

    const exhaustMaterial = new THREE.MeshStandardMaterial({
        color: 0x606060,
        roughness: 0.25,
        metalness: 0.90
    });

    const pipe1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.18, 12),
        exhaustMaterial
    );
    pipe1.rotation.x = Math.PI / 2;
    pipe1.position.set(0.35, 0.32, -0.77);
    pipe1.castShadow = true;
    exhaustGroup.add(pipe1);

    const pipe2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.25, 12),
        exhaustMaterial
    );
    pipe2.rotation.z = Math.PI / 7;
    pipe2.position.set(0.40, 0.48, -0.68);
    pipe2.castShadow = true;
    exhaustGroup.add(pipe2);

    const muffler = new THREE.Mesh(
        new THREE.CylinderGeometry(0.045, 0.045, 0.18, 16),
        exhaustMaterial
    );
    muffler.rotation.x = -Math.PI / 4;
    muffler.position.set(0.47, 0.62, -0.55);
    muffler.castShadow = true;
    exhaustGroup.add(muffler);

    return exhaustGroup;
}

function createKart() {
    const kartGroup = new THREE.Group();

    const frontWheelZ = 0.525;
    const rearWheelZ = -0.525;
    const frontTrackWidth = 0.57;
    const rearTrackWidth = 0.61;

    const frontWheelY = 0.127;
    const rearWheelY = 0.140;

    const frontLeftWheel = createWheel(true);
    frontLeftWheel.position.set(-frontTrackWidth, frontWheelY, frontWheelZ);
    kartGroup.add(frontLeftWheel);

    const frontRightWheel = createWheel(true);
    frontRightWheel.position.set(frontTrackWidth, frontWheelY, frontWheelZ);
    kartGroup.add(frontRightWheel);

    const rearLeftWheel = createWheel(false);
    rearLeftWheel.position.set(-rearTrackWidth, rearWheelY, rearWheelZ);
    kartGroup.add(rearLeftWheel);

    const rearRightWheel = createWheel(false);
    rearRightWheel.position.set(rearTrackWidth, rearWheelY, rearWheelZ);
    kartGroup.add(rearRightWheel);

    const rearAxle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.030, 0.030, rearTrackWidth * 2 + 0.1, 16),
        new THREE.MeshStandardMaterial({
            color: 0x505050,
            metalness: 0.9,
            roughness: 0.2
        })
    );
    rearAxle.rotation.z = Math.PI / 2;
    rearAxle.position.set(0, rearWheelY, rearWheelZ);
    rearAxle.castShadow = true;
    kartGroup.add(rearAxle);

    const frame = createFrame();
    kartGroup.add(frame);

    const seat = createSeat();
    kartGroup.add(seat);

    const steeringWheel = createSteeringWheel();
    kartGroup.add(steeringWheel);

    const engine = createEngine();
    kartGroup.add(engine);

    const exhaust = createExhaust();
    kartGroup.add(exhaust);

    return kartGroup;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xd0e8f5);
    scene.fog = new THREE.Fog(0xd0e8f5, 50, 300);

    camera = new THREE.PerspectiveCamera(
        45,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(2.2, 0.9, 2.5);
    camera.lookAt(0, 0.2, 0);

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
    renderer.toneMappingExposure = 1.1;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.2, 0);
    controls.minDistance = 1.0;
    controls.maxDistance = 15;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xd0e8f5, 0xa0a0a0, 1.0);
    scene.add(hemisphereLight);

    const sun = new THREE.DirectionalLight(0xffffff, 3.0);
    sun.position.set(30, 50, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 2048;
    sun.shadow.mapSize.height = 2048;
    sun.shadow.camera.near = 0.5;
    sun.shadow.camera.far = 150;
    sun.shadow.camera.left = -15;
    sun.shadow.camera.right = 15;
    sun.shadow.camera.top = 15;
    sun.shadow.camera.bottom = -15;
    sun.shadow.bias = -0.0001;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.5);
    rimLight.position.set(-25, 35, -35);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe6f2ff, 1.0);
    fillLight.position.set(0, -8, 20);
    scene.add(fillLight);

    const ground = createGroundPlane();
    scene.add(ground);

    const kart = createKart();
    scene.add(kart);

    console.log('3D Kart Racing Game - Rebuilt with Proper Proportions');
    console.log('Wheelbase: 1.05m, Front Track: 1.14m, Rear Track: 1.22m');
    console.log('Ground Clearance: 50mm, Camera at Hubcap Height');

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
