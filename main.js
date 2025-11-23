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
