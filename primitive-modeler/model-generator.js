import * as THREE from 'three';

/**
 * Material type presets for different surface appearances
 */
const MATERIAL_TYPES = {
    matte: { roughness: 0.9, metalness: 0.0 },
    glossy: { roughness: 0.2, metalness: 0.0 },
    metallic: { roughness: 0.3, metalness: 0.8 }
};

/**
 * Common material color presets
 */
const MATERIAL_PRESETS = {
    black: 0x1a1a1a,
    white: 0xf5f5f5,
    gray: 0x808080,
    darkGray: 0x404040,
    silver: 0xc0c0c0,
    blue: 0x2196f3,
    red: 0xf44336,
    yellow: 0xffeb3b,
    green: 0x4caf50
};

/**
 * Get a material preset color by name
 * @param {string} presetName - Name of the preset color
 * @returns {number} Hex color value
 */
export function getMaterialPreset(presetName) {
    return MATERIAL_PRESETS[presetName] || MATERIAL_PRESETS.gray;
}

/**
 * Create a material with specified properties
 * @param {string} type - Material type: 'matte', 'metallic', or 'glossy'
 * @param {number|string} color - Hex color or preset name
 * @param {object} options - Additional material options
 * @returns {THREE.MeshStandardMaterial}
 */
export function createMaterial(type = 'matte', color = 0x808080, options = {}) {
    const colorValue = typeof color === 'string' ? getMaterialPreset(color) : color;
    const typeConfig = MATERIAL_TYPES[type] || MATERIAL_TYPES.matte;

    return new THREE.MeshStandardMaterial({
        color: colorValue,
        roughness: options.roughness ?? typeConfig.roughness,
        metalness: options.metalness ?? typeConfig.metalness,
        ...options
    });
}

/**
 * Create a named group for organizing sub-assemblies
 * @param {string} name - Name identifier for the group
 * @returns {THREE.Group}
 */
export function createGroup(name) {
    const group = new THREE.Group();
    group.name = name;
    return group;
}

/**
 * Set position of an object
 * @param {THREE.Object3D} object - Object to position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {number} z - Z coordinate
 */
export function setPosition(object, x, y, z) {
    object.position.set(x, y, z);
}

/**
 * Set rotation of an object
 * @param {THREE.Object3D} object - Object to rotate
 * @param {number} rx - Rotation around X axis in radians
 * @param {number} ry - Rotation around Y axis in radians
 * @param {number} rz - Rotation around Z axis in radians
 */
export function setRotation(object, rx, ry, rz) {
    object.rotation.set(rx, ry, rz);
}

/**
 * Set scale of an object
 * @param {THREE.Object3D} object - Object to scale
 * @param {number} sx - Scale factor X
 * @param {number} sy - Scale factor Y
 * @param {number} sz - Scale factor Z
 */
export function setScale(object, sx, sy, sz) {
    object.scale.set(sx, sy, sz);
}

/**
 * Add a box primitive to a group
 * @param {THREE.Group} group - Group to add the box to
 * @param {number} width - Width of the box
 * @param {number} height - Height of the box
 * @param {number} depth - Depth of the box
 * @param {number[]} position - Position array [x, y, z]
 * @param {number[]} rotation - Rotation array [rx, ry, rz] in radians
 * @param {number|string} color - Hex color or preset name
 * @param {string} materialType - Material type: 'matte', 'metallic', or 'glossy'
 * @returns {THREE.Mesh}
 */
export function addBox(group, width, height, depth, position = [0, 0, 0], rotation = [0, 0, 0], color = 0x808080, materialType = 'matte') {
    const geometry = new THREE.BoxGeometry(width, height, depth);
    const material = createMaterial(materialType, color);
    const mesh = new THREE.Mesh(geometry, material);

    setPosition(mesh, position[0], position[1], position[2]);
    setRotation(mesh, rotation[0], rotation[1], rotation[2]);

    group.add(mesh);
    return mesh;
}

/**
 * Add a cylinder primitive to a group
 * @param {THREE.Group} group - Group to add the cylinder to
 * @param {number} radius - Radius of the cylinder
 * @param {number} height - Height of the cylinder
 * @param {number[]} position - Position array [x, y, z]
 * @param {number[]} rotation - Rotation array [rx, ry, rz] in radians
 * @param {number|string} color - Hex color or preset name
 * @param {string} materialType - Material type
 * @returns {THREE.Mesh}
 */
export function addCylinder(group, radius, height, position = [0, 0, 0], rotation = [0, 0, 0], color = 0x808080, materialType = 'matte') {
    const geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    const material = createMaterial(materialType, color);
    const mesh = new THREE.Mesh(geometry, material);

    setPosition(mesh, position[0], position[1], position[2]);
    setRotation(mesh, rotation[0], rotation[1], rotation[2]);

    group.add(mesh);
    return mesh;
}

/**
 * Add a sphere primitive to a group
 * @param {THREE.Group} group - Group to add the sphere to
 * @param {number} radius - Radius of the sphere
 * @param {number[]} position - Position array [x, y, z]
 * @param {number|string} color - Hex color or preset name
 * @param {string} materialType - Material type
 * @returns {THREE.Mesh}
 */
export function addSphere(group, radius, position = [0, 0, 0], color = 0x808080, materialType = 'matte') {
    const geometry = new THREE.SphereGeometry(radius, 32, 32);
    const material = createMaterial(materialType, color);
    const mesh = new THREE.Mesh(geometry, material);

    setPosition(mesh, position[0], position[1], position[2]);

    group.add(mesh);
    return mesh;
}

/**
 * Add a cone primitive to a group
 * @param {THREE.Group} group - Group to add the cone to
 * @param {number} radius - Radius of the cone base
 * @param {number} height - Height of the cone
 * @param {number[]} position - Position array [x, y, z]
 * @param {number[]} rotation - Rotation array [rx, ry, rz] in radians
 * @param {number|string} color - Hex color or preset name
 * @param {string} materialType - Material type
 * @returns {THREE.Mesh}
 */
export function addCone(group, radius, height, position = [0, 0, 0], rotation = [0, 0, 0], color = 0x808080, materialType = 'matte') {
    const geometry = new THREE.ConeGeometry(radius, height, 32);
    const material = createMaterial(materialType, color);
    const mesh = new THREE.Mesh(geometry, material);

    setPosition(mesh, position[0], position[1], position[2]);
    setRotation(mesh, rotation[0], rotation[1], rotation[2]);

    group.add(mesh);
    return mesh;
}

/**
 * Add a torus primitive to a group
 * @param {THREE.Group} group - Group to add the torus to
 * @param {number} radius - Radius of the torus ring
 * @param {number} tube - Radius of the tube
 * @param {number[]} position - Position array [x, y, z]
 * @param {number[]} rotation - Rotation array [rx, ry, rz] in radians
 * @param {number|string} color - Hex color or preset name
 * @param {string} materialType - Material type
 * @returns {THREE.Mesh}
 */
export function addTorus(group, radius, tube, position = [0, 0, 0], rotation = [0, 0, 0], color = 0x808080, materialType = 'matte') {
    const geometry = new THREE.TorusGeometry(radius, tube, 16, 100);
    const material = createMaterial(materialType, color);
    const mesh = new THREE.Mesh(geometry, material);

    setPosition(mesh, position[0], position[1], position[2]);
    setRotation(mesh, rotation[0], rotation[1], rotation[2]);

    group.add(mesh);
    return mesh;
}

/**
 * Clone a primitive with new transform
 * @param {THREE.Mesh} mesh - Mesh to clone
 * @param {number[]} position - New position array [x, y, z]
 * @param {number[]} rotation - New rotation array [rx, ry, rz] in radians
 * @returns {THREE.Mesh}
 */
export function clonePrimitive(mesh, position = [0, 0, 0], rotation = [0, 0, 0]) {
    const cloned = mesh.clone();
    setPosition(cloned, position[0], position[1], position[2]);
    setRotation(cloned, rotation[0], rotation[1], rotation[2]);
    return cloned;
}

/**
 * Example model: Simple modern table
 * Demonstrates three-phase construction approach
 * @returns {THREE.Group}
 */
export function createExampleTable() {
    const group = new THREE.Group();
    group.name = 'ExampleTable';

    // PHASE 1: SILHOUETTE
    // Main tabletop
    addBox(group, 4, 0.2, 2, [0, 2, 0], [0, 0, 0], 'gray', 'matte');

    // Four legs
    addBox(group, 0.2, 2, 0.2, [-1.8, 1, -0.8], [0, 0, 0], 'darkGray', 'matte');
    addBox(group, 0.2, 2, 0.2, [1.8, 1, -0.8], [0, 0, 0], 'darkGray', 'matte');
    addBox(group, 0.2, 2, 0.2, [-1.8, 1, 0.8], [0, 0, 0], 'darkGray', 'matte');
    addBox(group, 0.2, 2, 0.2, [1.8, 1, 0.8], [0, 0, 0], 'darkGray', 'matte');

    // PHASE 2: MAJOR FEATURES
    // Support braces
    addBox(group, 3.6, 0.1, 0.1, [0, 0.5, -0.8], [0, 0, 0], 'darkGray', 'matte');
    addBox(group, 3.6, 0.1, 0.1, [0, 0.5, 0.8], [0, 0, 0], 'darkGray', 'matte');
    addBox(group, 0.1, 0.1, 1.6, [-1.8, 0.5, 0], [0, 0, 0], 'darkGray', 'matte');
    addBox(group, 0.1, 0.1, 1.6, [1.8, 0.5, 0], [0, 0, 0], 'darkGray', 'matte');

    // PHASE 3: DETAILS
    // Leg caps (feet)
    addCylinder(group, 0.12, 0.05, [-1.8, 0.025, -0.8], [0, 0, 0], 'silver', 'metallic');
    addCylinder(group, 0.12, 0.05, [1.8, 0.025, -0.8], [0, 0, 0], 'silver', 'metallic');
    addCylinder(group, 0.12, 0.05, [-1.8, 0.025, 0.8], [0, 0, 0], 'silver', 'metallic');
    addCylinder(group, 0.12, 0.05, [1.8, 0.025, 0.8], [0, 0, 0], 'silver', 'metallic');

    // Decorative edge trim
    addBox(group, 4.1, 0.05, 0.05, [0, 2.125, 1.025], [0, 0, 0], 'black', 'glossy');
    addBox(group, 4.1, 0.05, 0.05, [0, 2.125, -1.025], [0, 0, 0], 'black', 'glossy');
    addBox(group, 0.05, 0.05, 2.05, [2.025, 2.125, 0], [0, 0, 0], 'black', 'glossy');
    addBox(group, 0.05, 0.05, 2.05, [-2.025, 2.125, 0], [0, 0, 0], 'black', 'glossy');

    return group;
}

/**
 * Auto-scales model to match reference measurements
 * @param {THREE.Group} model - Model to scale
 * @param {Object} measurements - Target measurements
 * @param {number} baseSize - Base unit size
 */
export function autoScaleToReference(model, measurements, baseSize = 10) {
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());

    const targetWidth = measurements.overall?.width || 1.0;
    const scale = (baseSize * targetWidth) / size.x;

    model.scale.multiplyScalar(scale);
}

/**
 * Converts ratio measurement to units
 * @param {number} ratio - Ratio value (0.0 to 1.0)
 * @param {number} baseSize - Base dimension in units
 * @returns {number} Calculated size in units
 */
export function measurementToUnits(ratio, baseSize) {
    return ratio * baseSize;
}

/**
 * Creates a mirrored clone of a mesh
 * @param {THREE.Mesh} mesh - Mesh to clone
 * @param {string} axis - Axis to mirror across ('x', 'y', 'z')
 * @returns {THREE.Mesh} Mirrored clone
 */
export function symmetryClone(mesh, axis = 'x') {
    const clone = mesh.clone();
    const multiplier = axis === 'x' ? -1 : 1;

    if (axis === 'x') {
        clone.position.x *= -1;
        clone.scale.x *= -1;
    } else if (axis === 'y') {
        clone.position.y *= -1;
        clone.scale.y *= -1;
    } else if (axis === 'z') {
        clone.position.z *= -1;
        clone.scale.z *= -1;
    }

    return clone;
}

/**
 * Snaps object position to grid
 * @param {THREE.Object3D} object - Object to align
 * @param {number} gridSize - Grid unit size
 */
export function alignToGrid(object, gridSize = 0.5) {
    object.position.x = Math.round(object.position.x / gridSize) * gridSize;
    object.position.y = Math.round(object.position.y / gridSize) * gridSize;
    object.position.z = Math.round(object.position.z / gridSize) * gridSize;
}

/**
 * Creates an array of evenly spaced positions
 * @param {Array<number>} start - Start position [x, y, z]
 * @param {Array<number>} end - End position [x, y, z]
 * @param {number} count - Number of positions
 * @returns {Array<Array<number>>} Array of positions
 */
export function createPositionArray(start, end, count) {
    const positions = [];
    for (let i = 0; i < count; i++) {
        const t = i / (count - 1);
        positions.push([
            start[0] + (end[0] - start[0]) * t,
            start[1] + (end[1] - start[1]) * t,
            start[2] + (end[2] - start[2]) * t
        ]);
    }
    return positions;
}

/**
 * Creates measurement helpers for reference
 * @param {Object} measurements - Measurement object
 * @returns {Object} Helper dimensions
 */
export function createMeasurementHelpers(measurements) {
    const base = measurements.overall?.width || 1.0;

    return {
        width: base,
        height: measurements.overall?.height || base * 0.4,
        depth: measurements.overall?.depth || base * 0.8,
        scale: (ratio) => ratio * base
    };
}

/**
 * Main model creation function
 * Replace this example with your actual model
 * @returns {THREE.Group}
 */
export function createModel() {
    const group = new THREE.Group();
    group.name = 'Model';

    // PHASE 1: SILHOUETTE (5-10 large primitives)
    // Define overall shape and proportions
    // Example: main body, wheels, major components

    const bodyGroup = createGroup('Body');
    addBox(bodyGroup, 4, 2, 6, [0, 1, 0], [0, 0, 0], 'blue', 'glossy');
    group.add(bodyGroup);

    const wheelGroup = createGroup('Wheels');
    addCylinder(wheelGroup, 0.8, 0.3, [-1.5, 0.8, 2], [0, 0, Math.PI / 2], 'black', 'matte');
    addCylinder(wheelGroup, 0.8, 0.3, [1.5, 0.8, 2], [0, 0, Math.PI / 2], 'black', 'matte');
    addCylinder(wheelGroup, 0.8, 0.3, [-1.5, 0.8, -2], [0, 0, Math.PI / 2], 'black', 'matte');
    addCylinder(wheelGroup, 0.8, 0.3, [1.5, 0.8, -2], [0, 0, Math.PI / 2], 'black', 'matte');
    group.add(wheelGroup);

    // PHASE 2: MAJOR FEATURES (20-40 medium primitives)
    // Add primary details and characteristics
    // Example: windows, doors, vents, panels

    const detailGroup = createGroup('Details');
    addBox(detailGroup, 3, 1, 0.1, [0, 2.5, 2.5], [0, 0, 0], 'white', 'glossy');
    addBox(detailGroup, 1.5, 0.8, 0.1, [-1, 2, -2.5], [0, 0, 0], 'white', 'glossy');
    addBox(detailGroup, 1.5, 0.8, 0.1, [1, 2, -2.5], [0, 0, 0], 'white', 'glossy');
    group.add(detailGroup);

    // PHASE 3: DETAILS (50-200+ small primitives)
    // Add fine details and finishing touches
    // Example: handles, badges, trim, lights

    const finishGroup = createGroup('Finishing');
    addSphere(finishGroup, 0.15, [-1.8, 1, 3], 'yellow', 'glossy');
    addSphere(finishGroup, 0.15, [1.8, 1, 3], 'yellow', 'glossy');
    addSphere(finishGroup, 0.1, [-1.8, 1, -3], 'red', 'glossy');
    addSphere(finishGroup, 0.1, [1.8, 1, -3], 'red', 'glossy');
    group.add(finishGroup);

    return group;
}
