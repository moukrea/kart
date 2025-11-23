import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js';

const canvas = document.getElementById('game-canvas');
let scene, camera, renderer, controls;
let engineMesh = null;
let wheelMeshes = [];
let kartSpeed = 0;

window.scene = null;
window.camera = null;
window.renderer = null;
window.controls = null;
window.kartSpeed = 0; // Exposed for gameplay controls

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
        new THREE.BoxGeometry(0.75, 0.01, 1.35),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    floorPan.position.set(0, 0.03, -0.05);
    floorPan.castShadow = true;
    kart.add(floorPan);

    const noseBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.95, 0.06, 0.30),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    noseBase.position.set(0, 0.06, 0.70);
    noseBase.castShadow = true;
    kart.add(noseBase);

    const noseTaper1 = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.05, 0.15),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    noseTaper1.position.set(0, 0.07, 0.90);
    noseTaper1.castShadow = true;
    kart.add(noseTaper1);

    const noseTaper2 = new THREE.Mesh(
        new THREE.BoxGeometry(0.70, 0.04, 0.12),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    noseTaper2.position.set(0, 0.06, 1.00);
    noseTaper2.castShadow = true;
    kart.add(noseTaper2);

    const nosePoint = new THREE.Mesh(
        new THREE.BoxGeometry(0.50, 0.03, 0.08),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    nosePoint.position.set(0, 0.05, 1.08);
    nosePoint.castShadow = true;
    kart.add(nosePoint);

    const noseTopPanel = new THREE.Mesh(
        new THREE.BoxGeometry(0.70, 0.02, 0.35),
        new THREE.MeshStandardMaterial({ color: blue, metalness: 0.3, roughness: 0.6 })
    );
    noseTopPanel.position.set(0, 0.10, 0.75);
    noseTopPanel.rotation.x = -0.1;
    noseTopPanel.castShadow = true;
    kart.add(noseTopPanel);

    const sidePodLeftMain = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.12, 0.90),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    sidePodLeftMain.position.set(-0.38, 0.08, 0.10);
    sidePodLeftMain.castShadow = true;
    kart.add(sidePodLeftMain);

    const sidePodRightMain = new THREE.Mesh(
        new THREE.BoxGeometry(0.15, 0.12, 0.90),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    sidePodRightMain.position.set(0.38, 0.08, 0.10);
    sidePodRightMain.castShadow = true;
    kart.add(sidePodRightMain);

    const sidePodLeftTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.03, 0.85),
        new THREE.MeshStandardMaterial({ color: blue, metalness: 0.3, roughness: 0.6 })
    );
    sidePodLeftTop.position.set(-0.38, 0.15, 0.10);
    sidePodLeftTop.rotation.x = -0.05;
    sidePodLeftTop.castShadow = true;
    kart.add(sidePodLeftTop);

    const sidePodRightTop = new THREE.Mesh(
        new THREE.BoxGeometry(0.13, 0.03, 0.85),
        new THREE.MeshStandardMaterial({ color: blue, metalness: 0.3, roughness: 0.6 })
    );
    sidePodRightTop.position.set(0.38, 0.15, 0.10);
    sidePodRightTop.rotation.x = -0.05;
    sidePodRightTop.castShadow = true;
    kart.add(sidePodRightTop);

    const seatWellLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.18, 0.55),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.8 })
    );
    seatWellLeft.position.set(-0.20, 0.12, -0.10);
    seatWellLeft.castShadow = true;
    kart.add(seatWellLeft);

    const seatWellRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.18, 0.55),
        new THREE.MeshStandardMaterial({ color: white, roughness: 0.8 })
    );
    seatWellRight.position.set(0.20, 0.12, -0.10);
    seatWellRight.castShadow = true;
    kart.add(seatWellRight);

    const seatBase = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.05, 0.48),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.9 })
    );
    seatBase.position.set(0, 0.08, -0.10);
    seatBase.castShadow = true;
    kart.add(seatBase);

    const seatBack = new THREE.Mesh(
        new THREE.BoxGeometry(0.35, 0.32, 0.05),
        new THREE.MeshStandardMaterial({ color: black, roughness: 0.9 })
    );
    seatBack.position.set(0, 0.20, -0.32);
    seatBack.rotation.x = -0.12;
    seatBack.castShadow = true;
    kart.add(seatBack);

    const rearBodyLeft = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.16, 0.35),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    rearBodyLeft.position.set(-0.32, 0.12, -0.52);
    rearBodyLeft.castShadow = true;
    kart.add(rearBodyLeft);

    const rearBodyRight = new THREE.Mesh(
        new THREE.BoxGeometry(0.20, 0.16, 0.35),
        new THREE.MeshStandardMaterial({ color: white, metalness: 0.2, roughness: 0.7 })
    );
    rearBodyRight.position.set(0.32, 0.12, -0.52);
    rearBodyRight.castShadow = true;
    kart.add(rearBodyRight);

    const frameLeftMain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 1.20, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameLeftMain.position.set(-0.25, 0.04, 0);
    frameLeftMain.rotation.z = Math.PI / 2;
    frameLeftMain.castShadow = true;
    kart.add(frameLeftMain);

    const frameRightMain = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 1.20, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameRightMain.position.set(0.25, 0.04, 0);
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

    const fuelTank = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.10, 0.16, 16),
        new THREE.MeshStandardMaterial({ color: black, metalness: 0.4, roughness: 0.6 })
    );
    fuelTank.position.set(0, 0.24, -0.22);
    fuelTank.rotation.z = Math.PI / 2;
    fuelTank.castShadow = true;
    kart.add(fuelTank);

    const brakeDiscFL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.10, 0.005, 24),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 })
    );
    brakeDiscFL.position.set(-0.52, 0.18, 0.62);
    brakeDiscFL.rotation.z = Math.PI / 2;
    brakeDiscFL.castShadow = true;
    kart.add(brakeDiscFL);

    const brakeCalliperFL = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.08, 0.10),
        new THREE.MeshStandardMaterial({ color: 0xff3333, metalness: 0.6, roughness: 0.4 })
    );
    brakeCalliperFL.position.set(-0.50, 0.23, 0.62);
    brakeCalliperFL.castShadow = true;
    kart.add(brakeCalliperFL);

    const brakeDiscFR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.10, 0.10, 0.005, 24),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 })
    );
    brakeDiscFR.position.set(0.52, 0.18, 0.62);
    brakeDiscFR.rotation.z = Math.PI / 2;
    brakeDiscFR.castShadow = true;
    kart.add(brakeDiscFR);

    const brakeCalliperFR = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.08, 0.10),
        new THREE.MeshStandardMaterial({ color: 0xff3333, metalness: 0.6, roughness: 0.4 })
    );
    brakeCalliperFR.position.set(0.50, 0.23, 0.62);
    brakeCalliperFR.castShadow = true;
    kart.add(brakeCalliperFR);

    const brakeDiscRL = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.006, 24),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 })
    );
    brakeDiscRL.position.set(-0.68, 0.22, -0.52);
    brakeDiscRL.rotation.z = Math.PI / 2;
    brakeDiscRL.castShadow = true;
    kart.add(brakeDiscRL);

    const brakeCalliperRL = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.10, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xff3333, metalness: 0.6, roughness: 0.4 })
    );
    brakeCalliperRL.position.set(-0.66, 0.28, -0.52);
    brakeCalliperRL.castShadow = true;
    kart.add(brakeCalliperRL);

    const brakeDiscRR = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 0.006, 24),
        new THREE.MeshStandardMaterial({ color: 0x888888, metalness: 0.9, roughness: 0.2 })
    );
    brakeDiscRR.position.set(0.68, 0.22, -0.52);
    brakeDiscRR.rotation.z = Math.PI / 2;
    brakeDiscRR.castShadow = true;
    kart.add(brakeDiscRR);

    const brakeCalliperRR = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.10, 0.12),
        new THREE.MeshStandardMaterial({ color: 0xff3333, metalness: 0.6, roughness: 0.4 })
    );
    brakeCalliperRR.position.set(0.66, 0.28, -0.52);
    brakeCalliperRR.castShadow = true;
    kart.add(brakeCalliperRR);

    const brakePedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.02, 0.10),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.7, roughness: 0.3 })
    );
    brakePedal.position.set(-0.06, 0.06, 0.35);
    brakePedal.rotation.x = -0.3;
    brakePedal.castShadow = true;
    kart.add(brakePedal);

    const throttlePedal = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, 0.02, 0.10),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.7, roughness: 0.3 })
    );
    throttlePedal.position.set(0.06, 0.06, 0.35);
    throttlePedal.rotation.x = -0.3;
    throttlePedal.castShadow = true;
    kart.add(throttlePedal);

    const chainSprocket = new THREE.Mesh(
        new THREE.CylinderGeometry(0.08, 0.08, 0.02, 16),
        new THREE.MeshStandardMaterial({ color: gray, metalness: 0.8, roughness: 0.3 })
    );
    chainSprocket.position.set(0.60, 0.22, -0.52);
    chainSprocket.rotation.z = Math.PI / 2;
    chainSprocket.castShadow = true;
    kart.add(chainSprocket);

    const chain1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.4 })
    );
    chain1.position.set(0.42, 0.26, -0.58);
    chain1.rotation.z = 0.6;
    chain1.castShadow = true;
    kart.add(chain1);

    const chain2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.25, 8),
        new THREE.MeshStandardMaterial({ color: 0x555555, metalness: 0.8, roughness: 0.4 })
    );
    chain2.position.set(0.42, 0.18, -0.58);
    chain2.rotation.z = -0.6;
    chain2.castShadow = true;
    kart.add(chain2);

    const frameDiagFrontLeftUp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.50, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameDiagFrontLeftUp.position.set(-0.20, 0.15, 0.50);
    frameDiagFrontLeftUp.rotation.set(0, 0, -0.8);
    frameDiagFrontLeftUp.castShadow = true;
    kart.add(frameDiagFrontLeftUp);

    const frameDiagFrontRightUp = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.50, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameDiagFrontRightUp.position.set(0.20, 0.15, 0.50);
    frameDiagFrontRightUp.rotation.set(0, 0, 0.8);
    frameDiagFrontRightUp.castShadow = true;
    kart.add(frameDiagFrontRightUp);

    const frameDiagFrontLeftDown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.50, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameDiagFrontLeftDown.position.set(-0.20, 0.05, 0.50);
    frameDiagFrontLeftDown.rotation.set(0, 0, 0.8);
    frameDiagFrontLeftDown.castShadow = true;
    kart.add(frameDiagFrontLeftDown);

    const frameDiagFrontRightDown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.50, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameDiagFrontRightDown.position.set(0.20, 0.05, 0.50);
    frameDiagFrontRightDown.rotation.set(0, 0, -0.8);
    frameDiagFrontRightDown.castShadow = true;
    kart.add(frameDiagFrontRightDown);

    const frameCross1 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.54, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameCross1.position.set(0, 0.05, 0.20);
    frameCross1.rotation.z = Math.PI / 2;
    frameCross1.castShadow = true;
    kart.add(frameCross1);

    const frameCross2 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.54, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameCross2.position.set(0, 0.05, -0.10);
    frameCross2.rotation.z = Math.PI / 2;
    frameCross2.castShadow = true;
    kart.add(frameCross2);

    const frameCross3 = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.36, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameCross3.position.set(0, 0.08, -0.50);
    frameCross3.rotation.z = Math.PI / 2;
    frameCross3.castShadow = true;
    kart.add(frameCross3);

    const frameDiagRearLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.40, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameDiagRearLeft.position.set(-0.14, 0.14, -0.35);
    frameDiagRearLeft.rotation.set(0.5, 0, -0.6);
    frameDiagRearLeft.castShadow = true;
    kart.add(frameDiagRearLeft);

    const frameDiagRearRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.40, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frameDiagRearRight.position.set(0.14, 0.14, -0.35);
    frameDiagRearRight.rotation.set(0.5, 0, 0.6);
    frameDiagRearRight.castShadow = true;
    kart.add(frameDiagRearRight);

    const rearAxle = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 1.36, 16),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.9, roughness: 0.2 })
    );
    rearAxle.position.set(0, 0.22, -0.52);
    rearAxle.rotation.z = Math.PI / 2;
    rearAxle.castShadow = true;
    kart.add(rearAxle);

    const frontAxleLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.020, 0.020, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.9, roughness: 0.2 })
    );
    frontAxleLeft.position.set(-0.52, 0.18, 0.62);
    frontAxleLeft.rotation.z = Math.PI / 2;
    frontAxleLeft.castShadow = true;
    kart.add(frontAxleLeft);

    const frontAxleRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.020, 0.020, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.9, roughness: 0.2 })
    );
    frontAxleRight.position.set(0.52, 0.18, 0.62);
    frontAxleRight.rotation.z = Math.PI / 2;
    frontAxleRight.castShadow = true;
    kart.add(frontAxleRight);

    const steeringArm = new THREE.Mesh(
        new THREE.CylinderGeometry(0.008, 0.008, 0.15, 8),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.3 })
    );
    steeringArm.position.set(-0.08, 0.08, 0.52);
    steeringArm.rotation.set(0, 0, 0.3);
    steeringArm.castShadow = true;
    kart.add(steeringArm);

    const frontFrameLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frontFrameLeft.position.set(-0.27, 0.05, 0.78);
    frontFrameLeft.rotation.x = Math.PI / 2;
    frontFrameLeft.castShadow = true;
    kart.add(frontFrameLeft);

    const frontFrameRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.015, 0.015, 0.25, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    frontFrameRight.position.set(0.27, 0.05, 0.78);
    frontFrameRight.rotation.x = Math.PI / 2;
    frontFrameRight.castShadow = true;
    kart.add(frontFrameRight);

    const rearFrameLeft = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.25, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    rearFrameLeft.position.set(-0.60, 0.12, -0.70);
    rearFrameLeft.rotation.x = Math.PI / 2;
    rearFrameLeft.castShadow = true;
    kart.add(rearFrameLeft);

    const rearFrameRight = new THREE.Mesh(
        new THREE.CylinderGeometry(0.018, 0.018, 0.25, 12),
        new THREE.MeshStandardMaterial({ color: silver, metalness: 0.8, roughness: 0.2 })
    );
    rearFrameRight.position.set(0.60, 0.12, -0.70);
    rearFrameRight.rotation.x = Math.PI / 2;
    rearFrameRight.castShadow = true;
    kart.add(rearFrameRight);

    return kart;
}

function setupEngineVisibilityControls() {
    if (!engineMesh || !engineMesh.material) return;

    const materials = Array.isArray(engineMesh.material) ? engineMesh.material : [engineMesh.material];

    // Group materials by type
    const engineBlockMats = materials.filter(m => m.name && m.name.toLowerCase().includes('grey_lght'));
    const leftMats = materials.filter(m => m.name && m.name.toLowerCase().includes('_left'));
    const rightMats = materials.filter(m => m.name && m.name.toLowerCase().includes('_right'));

    const toggleEngineBlock = document.getElementById('toggle-engine');
    const toggleExhaustLeft = document.getElementById('toggle-exhaust-left');
    const toggleExhaustRight = document.getElementById('toggle-exhaust-right');

    if (toggleEngineBlock) {
        toggleEngineBlock.addEventListener('change', (e) => {
            engineBlockMats.forEach(mat => {
                mat.opacity = e.target.checked ? 1.0 : 0.0;
                mat.transparent = !e.target.checked;
            });
            console.log('Engine Block visibility:', e.target.checked);
        });
    }

    if (toggleExhaustLeft) {
        toggleExhaustLeft.addEventListener('change', (e) => {
            leftMats.forEach(mat => {
                mat.opacity = e.target.checked ? 1.0 : 0.0;
                mat.transparent = !e.target.checked;
            });
            console.log('Left groups visibility:', e.target.checked);
        });
    }

    if (toggleExhaustRight) {
        toggleExhaustRight.addEventListener('change', (e) => {
            rightMats.forEach(mat => {
                mat.opacity = e.target.checked ? 1.0 : 0.0;
                mat.transparent = !e.target.checked;
            });
            console.log('Right groups visibility:', e.target.checked);
        });
    }

    console.log('Engine visibility controls initialized');
    console.log(`- Engine Block materials: ${engineBlockMats.length}`);
    console.log(`- Left materials: ${leftMats.length}`);
    console.log(`- Right materials: ${rightMats.length}`);
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
    renderer.localClippingEnabled = true;

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

    const loader = new ColladaLoader();
    const modelPath = import.meta.env.BASE_URL + 'assets/models/kart/pipeframe64_mario.dae';
    loader.load(
        modelPath,
        function (collada) {
            const kart = collada.scene;

            kart.scale.set(0.4, 0.4, 0.4);

            kart.rotation.x = -Math.PI / 2;
            kart.rotation.z = Math.PI;

            kart.position.y = 0;

            kart.traverse(function (child) {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;

                    const name = child.name.toLowerCase();
                    if (name.includes('engine')) {
                        engineMesh = child;
                    }

                    if (name.includes('wheel') || name.includes('tire')) {
                        wheelMeshes.push(child);
                    }

                    // Comprehensive material conversion: MeshLambertMaterial -> MeshStandardMaterial
                    if (child.material) {
                        const materials = Array.isArray(child.material) ? child.material : [child.material];
                        const isEngine = name.includes('engine');

                        const processedMaterials = materials.map((mat, idx) => {
                            const matName = mat.name ? mat.name.toLowerCase() : '';

                            // Convert to MeshStandardMaterial for PBR support
                            const newMat = new THREE.MeshStandardMaterial({
                                color: mat.color ? mat.color.getHex() : 0x808080,
                                map: mat.map || null,
                                name: mat.name
                            });

                            // WHEEL HUBS: rim_* materials override to metallic silver
                            if (matName.includes('rim')) {
                                newMat.color.setHex(0xc0c0c0);
                                newMat.metalness = 0.9;
                                newMat.roughness = 0.2;
                                newMat.map = null;
                                return newMat;
                            }

                            // TIRES: tyre/tire materials
                            if (matName.includes('tyre') || matName.includes('tire')) {
                                newMat.metalness = 0;
                                newMat.roughness = 0.95;
                                return newMat;
                            }

                            // ENGINE: all engine materials become metallic, preserve colors
                            if (isEngine) {
                                newMat.metalness = 0.7;
                                newMat.roughness = 0.3;
                                return newMat;
                            }

                            // FRAME/MAINBODY/AXEL: metallic, preserve color
                            if (name.includes('mainbody') || name.includes('axel') || name.includes('axle')) {
                                newMat.metalness = 0.8;
                                newMat.roughness = 0.3;
                                return newMat;
                            }

                            // PEDALS: metallic, preserve color
                            if (name.includes('pedal')) {
                                newMat.metalness = 0.8;
                                newMat.roughness = 0.3;
                                return newMat;
                            }

                            // STEERING WHEEL: rubbery for wheel part, metallic for column
                            if (name.includes('steeringwheel') || name.includes('steering_wheel')) {
                                if (matName.includes('grey_dark')) {
                                    newMat.metalness = 0;
                                    newMat.roughness = 0.85;
                                } else {
                                    newMat.metalness = 0.8;
                                    newMat.roughness = 0.3;
                                }
                                return newMat;
                            }

                            // SEAT: fabric-like, preserve color
                            if (name.includes('seat') || matName.includes('seat')) {
                                newMat.metalness = 0;
                                newMat.roughness = 0.9;
                                return newMat;
                            }

                            // Default: return with basic PBR properties
                            newMat.metalness = 0.2;
                            newMat.roughness = 0.7;
                            return newMat;
                        });

                        child.material = Array.isArray(child.material) ? processedMaterials : processedMaterials[0];
                    }
                }
            });

            // TODO: Split 3 material groups into left/right, keep Engine Block whole
            // Temporarily disabled to restore model visibility while debugging
            if (engineMesh) {
                console.log('Engine mesh loaded with', engineMesh.geometry.groups.length, 'groups');
                const materials = Array.isArray(engineMesh.material) ? engineMesh.material : [engineMesh.material];
                materials.forEach((mat, idx) => {
                    console.log(`Material ${idx}: ${mat.name}`);
                });
            }

            scene.add(kart);
            console.log('Downloaded kart model loaded successfully');
            console.log('Engine mesh:', engineMesh ? 'Yes' : 'No');
            console.log('Material groups:', engineMesh ? engineMesh.material.length : 0);
            console.log('Wheel meshes found:', wheelMeshes.length);
            console.log('To test wheel rotation: window.kartSpeed = 5 (forward) or -5 (backward)');

            setupEngineVisibilityControls();
        },
        function (xhr) {
            console.log('Loading model: ' + (xhr.loaded / xhr.total * 100).toFixed(0) + '%');
        },
        function (error) {
            console.error('Error loading kart model:', error);
            console.log('Falling back to procedural kart');
            const kart = createKart();
            scene.add(kart);
        }
    );

    console.log('Kart Racing Game - Loading 3D Model');

    animate();
}

let lastTime = Date.now();

function animate() {
    requestAnimationFrame(animate);

    const currentTime = Date.now();
    const deltaTime = (currentTime - lastTime) * 0.001;
    lastTime = currentTime;

    const time = currentTime * 0.001;

    // Engine animation: single mesh with 7 material groups
    // TODO: Implement per-material-group animation when needed

    // Wheel rotation based on speed
    // Typical wheel radius ~0.2 units, angular velocity = linear velocity / radius
    if (wheelMeshes.length > 0) {
        const wheelRadius = 0.2;
        const angularVelocity = window.kartSpeed / wheelRadius;
        const rotationDelta = angularVelocity * deltaTime;

        wheelMeshes.forEach(wheel => {
            // Rotate around local X axis (wheels spin forward/backward)
            wheel.rotation.x -= rotationDelta;
        });
    }

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
