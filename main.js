import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.getElementById('game-canvas');

let scene, camera, renderer, controls;

function createPedalGeometry() {
    const pedalAssembly = new THREE.Group();

    const PEDAL_SPECS = {
        mountingBar: {
            width: 0.4,
            height: 0.03,
            depth: 0.03,
            position: { x: 0, y: 0, z: 0 }
        },
        gas: {
            plate: {
                width: 0.08,
                height: 0.12,
                depth: 0.01,
                position: { x: 0.1, y: -0.12, z: 0.05 },
                rotation: { x: Math.PI * 0.15, y: 0, z: 0 }
            },
            arm: {
                radius: 0.008,
                length: 0.13,
                position: { x: 0.1, y: -0.065, z: 0.015 },
                rotation: { x: 0, y: 0, z: Math.PI / 2 }
            },
            pivot: {
                radius: 0.012,
                length: 0.02,
                position: { x: 0.1, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: Math.PI / 2 }
            }
        },
        brake: {
            plate: {
                width: 0.10,
                height: 0.14,
                depth: 0.01,
                position: { x: -0.1, y: -0.14, z: 0.06 },
                rotation: { x: Math.PI * 0.2, y: 0, z: 0 }
            },
            arm: {
                radius: 0.01,
                length: 0.15,
                position: { x: -0.1, y: -0.075, z: 0.015 },
                rotation: { x: 0, y: 0, z: Math.PI / 2 }
            },
            pivot: {
                radius: 0.014,
                length: 0.02,
                position: { x: -0.1, y: 0, z: 0 },
                rotation: { x: 0, y: 0, z: Math.PI / 2 }
            }
        },
        spacing: {
            centerToCenter: 0.2,
            heightFromFloor: 0.08,
            distanceFromSeat: 0.45
        }
    };

    const materials = {
        mounting: new THREE.MeshStandardMaterial({
            color: 0x2a2a2a,
            metalness: 0.8,
            roughness: 0.3
        }),
        gasPedal: new THREE.MeshStandardMaterial({
            color: 0x4a4a4a,
            metalness: 0.6,
            roughness: 0.4
        }),
        brakePedal: new THREE.MeshStandardMaterial({
            color: 0x8b0000,
            metalness: 0.5,
            roughness: 0.5
        }),
        arm: new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.9,
            roughness: 0.2
        }),
        pivot: new THREE.MeshStandardMaterial({
            color: 0x3a3a3a,
            metalness: 0.95,
            roughness: 0.1
        })
    };

    const mountingBar = new THREE.Mesh(
        new THREE.BoxGeometry(
            PEDAL_SPECS.mountingBar.width,
            PEDAL_SPECS.mountingBar.height,
            PEDAL_SPECS.mountingBar.depth
        ),
        materials.mounting
    );
    mountingBar.position.set(
        PEDAL_SPECS.mountingBar.position.x,
        PEDAL_SPECS.mountingBar.position.y,
        PEDAL_SPECS.mountingBar.position.z
    );
    mountingBar.castShadow = true;
    pedalAssembly.add(mountingBar);

    const gasPivot = new THREE.Mesh(
        new THREE.CylinderGeometry(
            PEDAL_SPECS.gas.pivot.radius,
            PEDAL_SPECS.gas.pivot.radius,
            PEDAL_SPECS.gas.pivot.length,
            16
        ),
        materials.pivot
    );
    gasPivot.position.set(
        PEDAL_SPECS.gas.pivot.position.x,
        PEDAL_SPECS.gas.pivot.position.y,
        PEDAL_SPECS.gas.pivot.position.z
    );
    gasPivot.rotation.set(
        PEDAL_SPECS.gas.pivot.rotation.x,
        PEDAL_SPECS.gas.pivot.rotation.y,
        PEDAL_SPECS.gas.pivot.rotation.z
    );
    gasPivot.castShadow = true;
    pedalAssembly.add(gasPivot);

    const gasArm = new THREE.Mesh(
        new THREE.CylinderGeometry(
            PEDAL_SPECS.gas.arm.radius,
            PEDAL_SPECS.gas.arm.radius,
            PEDAL_SPECS.gas.arm.length,
            12
        ),
        materials.arm
    );
    gasArm.position.set(
        PEDAL_SPECS.gas.arm.position.x,
        PEDAL_SPECS.gas.arm.position.y,
        PEDAL_SPECS.gas.arm.position.z
    );
    gasArm.rotation.set(
        PEDAL_SPECS.gas.arm.rotation.x,
        PEDAL_SPECS.gas.arm.rotation.y,
        PEDAL_SPECS.gas.arm.rotation.z
    );
    gasArm.castShadow = true;
    pedalAssembly.add(gasArm);

    const gasPedalPlate = new THREE.Mesh(
        new THREE.BoxGeometry(
            PEDAL_SPECS.gas.plate.width,
            PEDAL_SPECS.gas.plate.height,
            PEDAL_SPECS.gas.plate.depth
        ),
        materials.gasPedal
    );
    gasPedalPlate.position.set(
        PEDAL_SPECS.gas.plate.position.x,
        PEDAL_SPECS.gas.plate.position.y,
        PEDAL_SPECS.gas.plate.position.z
    );
    gasPedalPlate.rotation.set(
        PEDAL_SPECS.gas.plate.rotation.x,
        PEDAL_SPECS.gas.plate.rotation.y,
        PEDAL_SPECS.gas.plate.rotation.z
    );
    gasPedalPlate.castShadow = true;
    pedalAssembly.add(gasPedalPlate);

    const brakePivot = new THREE.Mesh(
        new THREE.CylinderGeometry(
            PEDAL_SPECS.brake.pivot.radius,
            PEDAL_SPECS.brake.pivot.radius,
            PEDAL_SPECS.brake.pivot.length,
            16
        ),
        materials.pivot
    );
    brakePivot.position.set(
        PEDAL_SPECS.brake.pivot.position.x,
        PEDAL_SPECS.brake.pivot.position.y,
        PEDAL_SPECS.brake.pivot.position.z
    );
    brakePivot.rotation.set(
        PEDAL_SPECS.brake.pivot.rotation.x,
        PEDAL_SPECS.brake.pivot.rotation.y,
        PEDAL_SPECS.brake.pivot.rotation.z
    );
    brakePivot.castShadow = true;
    pedalAssembly.add(brakePivot);

    const brakeArm = new THREE.Mesh(
        new THREE.CylinderGeometry(
            PEDAL_SPECS.brake.arm.radius,
            PEDAL_SPECS.brake.arm.radius,
            PEDAL_SPECS.brake.arm.length,
            12
        ),
        materials.arm
    );
    brakeArm.position.set(
        PEDAL_SPECS.brake.arm.position.x,
        PEDAL_SPECS.brake.arm.position.y,
        PEDAL_SPECS.brake.arm.position.z
    );
    brakeArm.rotation.set(
        PEDAL_SPECS.brake.arm.rotation.x,
        PEDAL_SPECS.brake.arm.rotation.y,
        PEDAL_SPECS.brake.arm.rotation.z
    );
    brakeArm.castShadow = true;
    pedalAssembly.add(brakeArm);

    const brakePedalPlate = new THREE.Mesh(
        new THREE.BoxGeometry(
            PEDAL_SPECS.brake.plate.width,
            PEDAL_SPECS.brake.plate.height,
            PEDAL_SPECS.brake.plate.depth
        ),
        materials.brakePedal
    );
    brakePedalPlate.position.set(
        PEDAL_SPECS.brake.plate.position.x,
        PEDAL_SPECS.brake.plate.position.y,
        PEDAL_SPECS.brake.plate.position.z
    );
    brakePedalPlate.rotation.set(
        PEDAL_SPECS.brake.plate.rotation.x,
        PEDAL_SPECS.brake.plate.rotation.y,
        PEDAL_SPECS.brake.plate.rotation.z
    );
    brakePedalPlate.castShadow = true;
    pedalAssembly.add(brakePedalPlate);

    pedalAssembly.position.set(0, PEDAL_SPECS.spacing.heightFromFloor, 0);

    return { assembly: pedalAssembly, specs: PEDAL_SPECS };
}

function createSeatReference() {
    const seatGroup = new THREE.Group();

    const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.08, 0.35),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.7,
            transparent: true,
            opacity: 0.3
        })
    );
    seatBase.position.set(0, 0.15, -0.45);
    seatGroup.add(seatBase);

    const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.4, 0.08),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.3,
            roughness: 0.7,
            transparent: true,
            opacity: 0.3
        })
    );
    seatBack.position.set(0, 0.35, -0.625);
    seatGroup.add(seatBack);

    return seatGroup;
}

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a0a0a);

    camera = new THREE.PerspectiveCamera(
        60,
        window.innerWidth / window.innerHeight,
        0.01,
        1000
    );
    camera.position.set(0.6, 0.3, 0.6);
    camera.lookAt(0, 0, 0);

    renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        antialias: true
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.target.set(0, 0.1, 0);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(1, 2, 1);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    mainLight.shadow.camera.near = 0.1;
    mainLight.shadow.camera.far = 10;
    mainLight.shadow.camera.left = -2;
    mainLight.shadow.camera.right = 2;
    mainLight.shadow.camera.top = 2;
    mainLight.shadow.camera.bottom = -2;
    scene.add(mainLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
    fillLight.position.set(-1, 0.5, -1);
    scene.add(fillLight);

    const floor = new THREE.Mesh(
        new THREE.PlaneGeometry(10, 10),
        new THREE.MeshStandardMaterial({
            color: 0x1a1a1a,
            metalness: 0.1,
            roughness: 0.9
        })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    const { assembly: pedals, specs } = createPedalGeometry();
    scene.add(pedals);

    const seatRef = createSeatReference();
    scene.add(seatRef);

    const gridHelper = new THREE.GridHelper(2, 20, 0x333333, 0x222222);
    scene.add(gridHelper);

    console.log('Kart Pedal Geometry Specifications:');
    console.log('===================================');
    console.log('Mounting Bar:', specs.mountingBar);
    console.log('Gas Pedal:', specs.gas);
    console.log('Brake Pedal:', specs.brake);
    console.log('Spacing:', specs.spacing);
    console.log('\nMeasurements in meters (scale for visualization)');

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
