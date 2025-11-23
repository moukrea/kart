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
        color: 0x808080,
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

    ctx.fillStyle = '#707070';
    ctx.fillRect(0, 0, 512, 512);

    ctx.strokeStyle = '#909090';
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

function createConcaveHub(outerRadius, width, dishDepth) {
    const points = [];
    const halfWidth = width / 2;
    const innerRadius = outerRadius * 0.35;

    points.push(new THREE.Vector2(outerRadius, -halfWidth));
    points.push(new THREE.Vector2(outerRadius * 0.95, -halfWidth + 0.003));

    const curvePoints = 10;
    for (let i = 0; i <= curvePoints; i++) {
        const t = i / curvePoints;
        const easeT = t * t;
        const radius = outerRadius * 0.95 - (outerRadius * 0.95 - innerRadius) * easeT;
        const y = -halfWidth + 0.003 + (halfWidth - 0.01) * t;
        const dishFactor = Math.sin(t * Math.PI);
        const concaveRadius = radius - (dishDepth * dishFactor);
        points.push(new THREE.Vector2(concaveRadius, y));
    }

    points.push(new THREE.Vector2(innerRadius, halfWidth - 0.01));
    points.push(new THREE.Vector2(innerRadius, halfWidth - 0.005));

    for (let i = 0; i <= curvePoints; i++) {
        const t = i / curvePoints;
        const easeT = t * t;
        const radius = innerRadius + (outerRadius * 0.95 - innerRadius) * easeT;
        const y = halfWidth - 0.005 - (0.005) * t;
        const dishFactor = Math.sin(t * Math.PI);
        const concaveRadius = radius - (dishDepth * 0.5 * dishFactor);
        points.push(new THREE.Vector2(concaveRadius, y));
    }

    points.push(new THREE.Vector2(outerRadius * 0.95, halfWidth));
    points.push(new THREE.Vector2(outerRadius, halfWidth));

    const geometry = new THREE.LatheGeometry(points, 32);
    return geometry;
}

function createWheel(isFront) {
    const wheelGroup = new THREE.Group();

    const tireMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.95,
        metalness: 0.0
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xe8e8e8,
        roughness: 0.20,
        metalness: 0.90
    });

    if (isFront) {
        const tireGeometry = new THREE.TorusGeometry(0.095, 0.057, 16, 32);
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        tire.receiveShadow = true;
        wheelGroup.add(tire);

        const rimGeometry = createConcaveHub(0.075, 0.065, 0.012);
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        wheelGroup.add(rim);
    } else {
        const tireGeometry = new THREE.TorusGeometry(0.101, 0.069, 16, 32);
        const tire = new THREE.Mesh(tireGeometry, tireMaterial);
        tire.rotation.y = Math.PI / 2;
        tire.castShadow = true;
        tire.receiveShadow = true;
        wheelGroup.add(tire);

        const rimGeometry = createConcaveHub(0.085, 0.08, 0.015);
        const rim = new THREE.Mesh(rimGeometry, rimMaterial);
        rim.rotation.z = Math.PI / 2;
        rim.castShadow = true;
        wheelGroup.add(rim);
    }

    return wheelGroup;
}

function createStraightTube(start, end, radius, material) {
    const direction = new THREE.Vector3().subVectors(end, start);
    const length = direction.length();
    const midpoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);

    const geometry = new THREE.CylinderGeometry(radius, radius, length, 8, 1, false);
    const mesh = new THREE.Mesh(geometry, material);

    const axis = new THREE.Vector3(0, 1, 0);
    mesh.quaternion.setFromUnitVectors(axis, direction.normalize());
    mesh.position.copy(midpoint);
    mesh.castShadow = true;

    return mesh;
}

function createJunctionSphere(position, radius, material) {
    const geometry = new THREE.SphereGeometry(radius, 12, 12);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(position);
    mesh.castShadow = true;
    return mesh;
}

function createFrame() {
    const frameGroup = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xc41e3a,
        roughness: 0.3,
        metalness: 0.7
    });

    const tubeRadius = 0.015;
    const junctionRadius = tubeRadius * 1.08;

    const junctions = {
        rearLeft: new THREE.Vector3(-0.3, 0.08, -0.52),
        rearRight: new THREE.Vector3(0.3, 0.08, -0.52),
        midRearLeft: new THREE.Vector3(-0.285, 0.08, -0.12),
        midRearRight: new THREE.Vector3(0.285, 0.08, -0.12),
        midLeft: new THREE.Vector3(-0.275, 0.08, 0.18),
        midRight: new THREE.Vector3(0.275, 0.08, 0.18),
        frontLeft: new THREE.Vector3(-0.275, 0.085, 0.48),
        frontRight: new THREE.Vector3(0.275, 0.085, 0.48),
        frontNoseLeft: new THREE.Vector3(-0.275, 0.075, 0.53),
        frontNoseRight: new THREE.Vector3(0.275, 0.075, 0.53),
        rollBarLeft: new THREE.Vector3(-0.15, 0.48, -0.15),
        rollBarRight: new THREE.Vector3(0.15, 0.48, -0.15),
        rollBarBottomLeft: new THREE.Vector3(-0.15, 0.08, -0.15),
        rollBarBottomRight: new THREE.Vector3(0.15, 0.08, -0.15)
    };

    const tubes = [
        [junctions.rearLeft, junctions.midRearLeft],
        [junctions.midRearLeft, junctions.midLeft],
        [junctions.midLeft, junctions.frontLeft],
        [junctions.frontLeft, junctions.frontNoseLeft],
        [junctions.rearRight, junctions.midRearRight],
        [junctions.midRearRight, junctions.midRight],
        [junctions.midRight, junctions.frontRight],
        [junctions.frontRight, junctions.frontNoseRight],
        [junctions.rearLeft, junctions.rearRight],
        [junctions.midRearLeft, junctions.midRearRight],
        [junctions.midLeft, junctions.midRight],
        [junctions.frontLeft, junctions.frontRight],
        [junctions.frontNoseLeft, junctions.frontNoseRight],
        [junctions.rollBarBottomLeft, junctions.rollBarLeft],
        [junctions.rollBarBottomRight, junctions.rollBarRight],
        [junctions.rollBarLeft, junctions.rollBarRight],
        [junctions.midRearLeft, junctions.rollBarBottomLeft],
        [junctions.midRearRight, junctions.rollBarBottomRight]
    ];

    tubes.forEach(([start, end]) => {
        const tube = createStraightTube(start, end, tubeRadius, frameMaterial);
        frameGroup.add(tube);
    });

    Object.values(junctions).forEach(pos => {
        const sphere = createJunctionSphere(pos, junctionRadius, frameMaterial);
        frameGroup.add(sphere);
    });

    return frameGroup;
}

function createAxleAssembly() {
    const assemblyGroup = new THREE.Group();

    const axleMaterial = new THREE.MeshStandardMaterial({
        color: 0x606060,
        metalness: 0.9,
        roughness: 0.2
    });

    const bearingMaterial = new THREE.MeshStandardMaterial({
        color: 0x505050,
        metalness: 0.7,
        roughness: 0.3
    });

    const axleGeometry = new THREE.CylinderGeometry(0.030, 0.030, 1.25, 16);
    const axle = new THREE.Mesh(axleGeometry, axleMaterial);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0, 0.135, -0.52);
    axle.castShadow = true;
    assemblyGroup.add(axle);

    const bearingGeometry = new THREE.BoxGeometry(0.09, 0.07, 0.05);
    const leftBearing = new THREE.Mesh(bearingGeometry, bearingMaterial);
    leftBearing.position.set(-0.45, 0.135, -0.52);
    leftBearing.castShadow = true;
    assemblyGroup.add(leftBearing);

    const rightBearing = new THREE.Mesh(bearingGeometry, bearingMaterial);
    rightBearing.position.set(0.45, 0.135, -0.52);
    rightBearing.castShadow = true;
    assemblyGroup.add(rightBearing);

    const supportGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.055, 8);
    const leftSupport = new THREE.Mesh(supportGeometry, axleMaterial);
    leftSupport.position.set(-0.45, 0.1075, -0.52);
    leftSupport.castShadow = true;
    assemblyGroup.add(leftSupport);

    const rightSupport = new THREE.Mesh(supportGeometry, axleMaterial);
    rightSupport.position.set(0.45, 0.1075, -0.52);
    rightSupport.castShadow = true;
    assemblyGroup.add(rightSupport);

    const frontSpindleMaterial = new THREE.MeshStandardMaterial({
        color: 0x505050,
        metalness: 0.85,
        roughness: 0.25
    });

    const spindleGeometry = new THREE.CylinderGeometry(0.018, 0.018, 0.12, 12);

    const leftSpindle = new THREE.Mesh(spindleGeometry, frontSpindleMaterial);
    leftSpindle.rotation.z = Math.PI / 2;
    leftSpindle.position.set(-0.275, 0.125, 0.52);
    leftSpindle.castShadow = true;
    assemblyGroup.add(leftSpindle);

    const rightSpindle = new THREE.Mesh(spindleGeometry, frontSpindleMaterial);
    rightSpindle.rotation.z = Math.PI / 2;
    rightSpindle.position.set(0.275, 0.125, 0.52);
    rightSpindle.castShadow = true;
    assemblyGroup.add(rightSpindle);

    const spindleSupportGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.07, 8);

    const leftSpindleSupport = new THREE.Mesh(spindleSupportGeometry, frontSpindleMaterial);
    leftSpindleSupport.position.set(-0.275, 0.09, 0.52);
    leftSpindleSupport.castShadow = true;
    assemblyGroup.add(leftSpindleSupport);

    const rightSpindleSupport = new THREE.Mesh(spindleSupportGeometry, frontSpindleMaterial);
    rightSpindleSupport.position.set(0.275, 0.09, 0.52);
    rightSpindleSupport.castShadow = true;
    assemblyGroup.add(rightSpindleSupport);

    return assemblyGroup;
}

function createSeat() {
    const seatGroup = new THREE.Group();

    const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.7,
        metalness: 0.1
    });

    const baseGeometry = new THREE.BoxGeometry(0.35, 0.08, 0.40);
    const baseMesh = new THREE.Mesh(baseGeometry, seatMaterial);
    baseMesh.position.set(0, 0, 0);
    baseMesh.castShadow = true;
    seatGroup.add(baseMesh);

    const backGeometry = new THREE.BoxGeometry(0.35, 0.35, 0.08);
    const backMesh = new THREE.Mesh(backGeometry, seatMaterial);
    backMesh.position.set(0, 0.15, -0.16);
    backMesh.rotation.x = -0.3;
    backMesh.castShadow = true;
    seatGroup.add(backMesh);

    const bolsterGeometry = new THREE.BoxGeometry(0.08, 0.20, 0.30);

    const leftBolster = new THREE.Mesh(bolsterGeometry, seatMaterial);
    leftBolster.position.set(-0.18, 0.06, -0.05);
    leftBolster.castShadow = true;
    seatGroup.add(leftBolster);

    const rightBolster = new THREE.Mesh(bolsterGeometry, seatMaterial);
    rightBolster.position.set(0.18, 0.06, -0.05);
    rightBolster.castShadow = true;
    seatGroup.add(rightBolster);

    seatGroup.position.set(0, 0.12, -0.05);

    return seatGroup;
}

function createSteeringWheel() {
    const wheelGroup = new THREE.Group();

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        roughness: 0.6,
        metalness: 0.2
    });

    const spokeMaterial = new THREE.MeshStandardMaterial({
        color: 0x505050,
        roughness: 0.3,
        metalness: 0.7
    });

    const rimGeometry = new THREE.TorusGeometry(0.14, 0.015, 12, 32);
    const rim = new THREE.Mesh(rimGeometry, rimMaterial);
    rim.castShadow = true;
    wheelGroup.add(rim);

    const spokeGeometry = new THREE.BoxGeometry(0.008, 0.14, 0.025);

    for (let i = 0; i < 3; i++) {
        const spoke = new THREE.Mesh(spokeGeometry, spokeMaterial);
        spoke.rotation.z = (i / 3) * Math.PI * 2;
        spoke.castShadow = true;
        wheelGroup.add(spoke);
    }

    const hubGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.03, 24);
    const hub = new THREE.Mesh(hubGeometry, spokeMaterial);
    hub.rotation.x = Math.PI / 2;
    hub.castShadow = true;
    wheelGroup.add(hub);

    const columnMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.25,
        metalness: 0.85
    });

    const columnGeometry = new THREE.CylinderGeometry(0.012, 0.012, 0.30, 12);
    const column = new THREE.Mesh(columnGeometry, columnMaterial);
    column.position.y = -0.15;
    column.castShadow = true;
    wheelGroup.add(column);

    const bracketGeometry = new THREE.BoxGeometry(0.045, 0.025, 0.06);
    const bracket = new THREE.Mesh(bracketGeometry, columnMaterial);
    bracket.position.y = -0.30;
    bracket.castShadow = true;
    wheelGroup.add(bracket);

    wheelGroup.position.set(0, 0.35, 0.28);
    wheelGroup.rotation.x = -0.35;

    return wheelGroup;
}

function createPedals() {
    const pedalGroup = new THREE.Group();

    const mountMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        metalness: 0.8,
        roughness: 0.3
    });

    const mount = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8),
        mountMaterial
    );
    mount.rotation.z = Math.PI / 2;
    mount.position.set(0, 0.08, 0.45);
    mount.castShadow = true;
    pedalGroup.add(mount);

    const gasPedalMaterial = new THREE.MeshStandardMaterial({
        color: 0x606060,
        metalness: 0.5,
        roughness: 0.5
    });

    const brakePedalMaterial = new THREE.MeshStandardMaterial({
        color: 0xa03030,
        metalness: 0.4,
        roughness: 0.6
    });

    const gasPedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.055, 0.09, 0.012),
        gasPedalMaterial
    );
    gasPedal.position.set(0.07, 0.04, 0.48);
    gasPedal.rotation.x = 0.4;
    gasPedal.castShadow = true;
    pedalGroup.add(gasPedal);

    const brakePedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.065, 0.11, 0.012),
        brakePedalMaterial
    );
    brakePedal.position.set(-0.07, 0.04, 0.48);
    brakePedal.rotation.x = 0.4;
    brakePedal.castShadow = true;
    pedalGroup.add(brakePedal);

    return pedalGroup;
}

function createEngine() {
    const engineGroup = new THREE.Group();

    const engineMaterial = new THREE.MeshStandardMaterial({
        color: 0x505050,
        roughness: 0.4,
        metalness: 0.6
    });

    const blockGeometry = new THREE.BoxGeometry(0.18, 0.25, 0.22);
    const block = new THREE.Mesh(blockGeometry, engineMaterial);
    block.castShadow = true;
    engineGroup.add(block);

    const cylinderMaterial = new THREE.MeshStandardMaterial({
        color: 0x404040,
        roughness: 0.3,
        metalness: 0.8
    });

    const cylinderGeometry = new THREE.CylinderGeometry(0.04, 0.04, 0.12, 16);
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.set(0, 0.15, 0);
    cylinder.castShadow = true;
    engineGroup.add(cylinder);

    const headGeometry = new THREE.CylinderGeometry(0.055, 0.045, 0.05, 16);
    const head = new THREE.Mesh(headGeometry, cylinderMaterial);
    head.position.set(0, 0.235, 0);
    head.castShadow = true;
    engineGroup.add(head);

    engineGroup.position.set(0.22, 0.2, -0.4);

    return engineGroup;
}

function createExhaust() {
    const exhaustGroup = new THREE.Group();

    const exhaustMaterial = new THREE.MeshStandardMaterial({
        color: 0x707070,
        roughness: 0.15,
        metalness: 0.95
    });

    const pipe1Geometry = new THREE.CylinderGeometry(0.020, 0.020, 0.15, 12);
    const pipe1 = new THREE.Mesh(pipe1Geometry, exhaustMaterial);
    pipe1.rotation.x = Math.PI / 2;
    pipe1.position.set(0.22, 0.28, -0.325);
    pipe1.castShadow = true;
    exhaustGroup.add(pipe1);

    const pipe2Geometry = new THREE.CylinderGeometry(0.020, 0.020, 0.20, 12);
    const pipe2 = new THREE.Mesh(pipe2Geometry, exhaustMaterial);
    pipe2.rotation.z = Math.PI / 6;
    pipe2.position.set(0.27, 0.38, -0.25);
    pipe2.castShadow = true;
    exhaustGroup.add(pipe2);

    const mufflerGeometry = new THREE.CylinderGeometry(0.035, 0.035, 0.14, 16);
    const muffler = new THREE.Mesh(mufflerGeometry, exhaustMaterial);
    muffler.rotation.x = -Math.PI / 3;
    muffler.position.set(0.32, 0.48, -0.15);
    muffler.castShadow = true;
    exhaustGroup.add(muffler);

    return exhaustGroup;
}

function createKart() {
    const kartGroup = new THREE.Group();

    const frame = createFrame();
    kartGroup.add(frame);

    const axleAssembly = createAxleAssembly();
    kartGroup.add(axleAssembly);

    const frontLeftWheel = createWheel(true);
    frontLeftWheel.position.set(-0.275, 0.125, 0.52);
    kartGroup.add(frontLeftWheel);

    const frontRightWheel = createWheel(true);
    frontRightWheel.position.set(0.275, 0.125, 0.52);
    kartGroup.add(frontRightWheel);

    const rearLeftWheel = createWheel(false);
    rearLeftWheel.position.set(-0.575, 0.135, -0.52);
    kartGroup.add(rearLeftWheel);

    const rearRightWheel = createWheel(false);
    rearRightWheel.position.set(0.575, 0.135, -0.52);
    kartGroup.add(rearRightWheel);

    const seat = createSeat();
    kartGroup.add(seat);

    const steeringWheel = createSteeringWheel();
    kartGroup.add(steeringWheel);

    const pedals = createPedals();
    kartGroup.add(pedals);

    const engine = createEngine();
    kartGroup.add(engine);

    const exhaust = createExhaust();
    kartGroup.add(exhaust);

    return kartGroup;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xb0d4f1);
    scene.fog = new THREE.Fog(0xb0d4f1, 50, 300);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    camera.position.set(2.5, 1.5, 3);
    camera.lookAt(0, 0.25, 0);

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
    controls.target.set(0, 0.25, 0);
    controls.minDistance = 1.0;
    controls.maxDistance = 15;
    controls.minPolarAngle = Math.PI / 6;
    controls.maxPolarAngle = Math.PI / 2.2;

    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);

    const hemisphereLight = new THREE.HemisphereLight(0xb0d4f1, 0x808080, 0.8);
    scene.add(hemisphereLight);

    const sun = new THREE.DirectionalLight(0xffffff, 2.5);
    sun.position.set(40, 60, 30);
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

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.2);
    rimLight.position.set(-30, 40, -40);
    scene.add(rimLight);

    const fillLight = new THREE.DirectionalLight(0xe6f2ff, 0.8);
    fillLight.position.set(0, -10, 20);
    scene.add(fillLight);

    const ground = createGroundPlane();
    scene.add(ground);

    const kart = createKart();
    scene.add(kart);

    console.log('3D Kart Racing Game - Complete Assembly');
    console.log('Components: Frame, Wheels, Axles, Seat, Steering, Pedals, Engine, Exhaust');
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
