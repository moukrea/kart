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
        color: 0x1a1a1a,
        roughness: 0.95,
        metalness: 0.0
    });

    const rimMaterial = new THREE.MeshStandardMaterial({
        color: 0xd4d4d4,
        roughness: 0.25,
        metalness: 0.85
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
        color: 0x404040,
        metalness: 0.9,
        roughness: 0.2
    });

    const bearingMaterial = new THREE.MeshStandardMaterial({
        color: 0x2a2a2a,
        metalness: 0.6,
        roughness: 0.4
    });

    const axleGeometry = new THREE.CylinderGeometry(0.025, 0.025, 1.25, 16);
    const axle = new THREE.Mesh(axleGeometry, axleMaterial);
    axle.rotation.z = Math.PI / 2;
    axle.position.set(0, 0.135, -0.52);
    axle.castShadow = true;
    assemblyGroup.add(axle);

    const bearingGeometry = new THREE.BoxGeometry(0.08, 0.06, 0.04);
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

    return assemblyGroup;
}

function createSeat() {
    const seatGroup = new THREE.Group();

    const seatMaterial = new THREE.MeshStandardMaterial({
        color: 0x1a1a1a,
        roughness: 0.8,
        metalness: 0.0
    });

    const createRoundedProfile = (width, height) => {
        const shape = new THREE.Shape();
        const w = width / 2;
        const h = height / 2;
        const r = Math.min(width, height) * 0.1;

        shape.moveTo(-w + r, -h);
        shape.lineTo(w - r, -h);
        shape.quadraticCurveTo(w, -h, w, -h + r);
        shape.lineTo(w, h - r);
        shape.quadraticCurveTo(w, h, w - r, h);
        shape.lineTo(-w + r, h);
        shape.quadraticCurveTo(-w, h, -w, h - r);
        shape.lineTo(-w, -h + r);
        shape.quadraticCurveTo(-w, -h, -w + r, -h);

        return shape;
    };

    const baseShape = createRoundedProfile(0.35, 0.05);
    const baseGeometry = new THREE.ExtrudeGeometry(baseShape, {
        depth: 0.40,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 4,
        curveSegments: 16
    });
    const baseMesh = new THREE.Mesh(baseGeometry, seatMaterial);
    baseMesh.rotation.x = Math.PI / 2;
    baseMesh.position.set(-0.175, 0, -0.2);
    baseMesh.castShadow = true;
    baseMesh.geometry.computeVertexNormals();
    seatGroup.add(baseMesh);

    const backShape = createRoundedProfile(0.35, 0.4);
    const backGeometry = new THREE.ExtrudeGeometry(backShape, {
        depth: 0.05,
        bevelEnabled: true,
        bevelThickness: 0.008,
        bevelSize: 0.008,
        bevelSegments: 4,
        curveSegments: 16
    });
    const backMesh = new THREE.Mesh(backGeometry, seatMaterial);
    backMesh.rotation.x = Math.PI / 2;
    backMesh.rotation.y = -0.26;
    backMesh.position.set(-0.175, 0.175, -0.175);
    backMesh.castShadow = true;
    backMesh.geometry.computeVertexNormals();
    seatGroup.add(backMesh);

    const bolsterGeometry = new THREE.CylinderGeometry(0.025, 0.035, 0.30, 24, 8, false);

    const leftBolster = new THREE.Mesh(bolsterGeometry, seatMaterial);
    leftBolster.position.set(-0.18, 0.08, -0.05);
    leftBolster.rotation.x = -0.175;
    leftBolster.castShadow = true;
    leftBolster.geometry.computeVertexNormals();
    seatGroup.add(leftBolster);

    const rightBolster = new THREE.Mesh(bolsterGeometry, seatMaterial);
    rightBolster.position.set(0.18, 0.08, -0.05);
    rightBolster.rotation.x = -0.175;
    rightBolster.castShadow = true;
    rightBolster.geometry.computeVertexNormals();
    seatGroup.add(rightBolster);

    seatGroup.position.set(0, 0.10, -0.1);

    return seatGroup;
}

function createSeatMounting() {
    const mountGroup = new THREE.Group();

    const frameMaterial = new THREE.MeshStandardMaterial({
        color: 0xc41e3a,
        roughness: 0.3,
        metalness: 0.7
    });

    const bracketPositions = [
        new THREE.Vector3(-0.175, 0.08, 0.0),
        new THREE.Vector3(0.175, 0.08, 0.0),
        new THREE.Vector3(-0.175, 0.08, -0.25),
        new THREE.Vector3(0.175, 0.08, -0.25)
    ];

    bracketPositions.forEach(pos => {
        const vertTube = createStraightTube(
            pos,
            new THREE.Vector3(pos.x, 0.10, pos.z),
            0.008,
            frameMaterial
        );
        mountGroup.add(vertTube);
    });

    const strutMaterial = new THREE.MeshStandardMaterial({
        color: 0xa0a0a0,
        roughness: 0.3,
        metalness: 0.8
    });

    const leftStrut = createStraightTube(
        new THREE.Vector3(-0.15, 0.45, -0.3),
        new THREE.Vector3(-0.288, 0.15, -0.52),
        0.01,
        strutMaterial
    );
    mountGroup.add(leftStrut);

    const rightStrut = createStraightTube(
        new THREE.Vector3(0.15, 0.45, -0.3),
        new THREE.Vector3(0.288, 0.15, -0.52),
        0.01,
        strutMaterial
    );
    mountGroup.add(rightStrut);

    return mountGroup;
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

    const seatMounting = createSeatMounting();
    kartGroup.add(seatMounting);

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
    camera.lookAt(0, 0.3, 0);

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

    console.log('3D Kart Racing Game - Properly Designed');
    console.log('Front wheels: 10x4.5-5 (smaller, narrow)');
    console.log('Rear wheels: 11x7.1-5 (larger, wide)');
    console.log('Concave hubs with LatheGeometry');
    console.log('Tubular frame with proper connections');
    console.log('Smooth curved seat with rounded edges');
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
