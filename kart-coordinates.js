/**
 * Kart Spatial Positioning System
 *
 * Coordinate System:
 * - Origin (0, 0, 0) is at the center of the kart frame at ground level
 * - X-axis: Left (-) to Right (+)
 * - Y-axis: Down (-) to Up (+)
 * - Z-axis: Rear (-) to Front (+)
 *
 * All measurements in meters based on standard racing kart dimensions:
 * - Overall length: ~1.8m
 * - Overall width: ~1.4m
 * - Wheelbase: ~1.04m
 * - Track width (front): ~1.05m
 * - Track width (rear): ~1.15m
 * - Seat height: ~0.15m from ground
 * - Overall height with driver: ~1.0m
 */

export const KartCoordinates = {
  // Reference point: Frame center at ground level
  frame: {
    center: { x: 0, y: 0, z: 0 },
    length: 1.8,
    width: 1.4,
    height: 0.3,
    groundClearance: 0.03,
  },

  // Wheels: positioned relative to frame center
  wheels: {
    // Front left wheel
    frontLeft: {
      position: { x: -0.525, y: 0.125, z: 0.52 },
      radius: 0.125,
      width: 0.095,
      axleOffset: { x: 0, y: 0, z: 0 }, // mounting point on axle
    },
    // Front right wheel
    frontRight: {
      position: { x: 0.525, y: 0.125, z: 0.52 },
      radius: 0.125,
      width: 0.095,
      axleOffset: { x: 0, y: 0, z: 0 },
    },
    // Rear left wheel
    rearLeft: {
      position: { x: -0.575, y: 0.135, z: -0.52 },
      radius: 0.135,
      width: 0.115,
      axleOffset: { x: 0, y: 0, z: 0 },
    },
    // Rear right wheel
    rearRight: {
      position: { x: 0.575, y: 0.135, z: -0.52 },
      radius: 0.135,
      width: 0.115,
      axleOffset: { x: 0, y: 0, z: 0 },
    },
    // Derived measurements
    wheelbase: 1.04,        // distance between front and rear axles
    trackWidthFront: 1.05,  // distance between front wheel centers
    trackWidthRear: 1.15,   // distance between rear wheel centers
  },

  // Seat: positioned behind frame center
  seat: {
    position: { x: 0, y: 0.15, z: -0.1 },
    width: 0.35,
    depth: 0.45,
    height: 0.25,
    backrestAngle: 15, // degrees from vertical
    backrestHeight: 0.4,
    // Driver reference point (where driver's hips rest)
    driverHipPoint: { x: 0, y: 0.23, z: -0.1 },
  },

  // Steering wheel: positioned in front of seat
  steeringWheel: {
    position: { x: 0, y: 0.42, z: 0.25 },
    radius: 0.14,
    thickness: 0.025,
    columnLength: 0.35,
    columnAngle: 25, // degrees from vertical, tilted toward driver
    // Connection point to steering column
    columnBasePosition: { x: 0, y: 0.15, z: 0.35 },
    // Offset from seat driver hip point
    offsetFromSeat: { x: 0, y: 0.19, z: 0.35 },
  },

  // Pedals: positioned in front of seat, below steering wheel
  pedals: {
    // Accelerator (right pedal)
    accelerator: {
      position: { x: 0.08, y: 0.08, z: 0.4 },
      width: 0.06,
      height: 0.12,
      depth: 0.02,
      restAngle: 30, // degrees from vertical
      maxTravelAngle: 50,
      offsetFromSeat: { x: 0.08, y: -0.15, z: 0.5 },
    },
    // Brake (left pedal)
    brake: {
      position: { x: -0.08, y: 0.08, z: 0.4 },
      width: 0.06,
      height: 0.12,
      depth: 0.02,
      restAngle: 30,
      maxTravelAngle: 50,
      offsetFromSeat: { x: -0.08, y: -0.15, z: 0.5 },
    },
    // Pedal assembly mount point
    mountPosition: { x: 0, y: 0.05, z: 0.42 },
    pedalSpacing: 0.16, // center-to-center distance between pedals
  },

  // Additional structural components for reference
  engine: {
    position: { x: 0.08, y: 0.2, z: -0.65 },
    dimensions: { x: 0.25, y: 0.3, z: 0.35 },
  },

  bodywork: {
    nose: {
      position: { x: 0, y: 0.12, z: 0.85 },
      width: 0.4,
      height: 0.15,
    },
    sidePods: {
      left: { position: { x: -0.55, y: 0.15, z: 0.15 }, width: 0.12, length: 0.8 },
      right: { position: { x: 0.55, y: 0.15, z: 0.15 }, width: 0.12, length: 0.8 },
    },
    rearBumper: {
      position: { x: 0, y: 0.25, z: -0.88 },
      width: 1.0,
      height: 0.08,
    },
  },

  // Proportional relationships for validation
  proportions: {
    wheelbaseLengthRatio: 0.578,  // wheelbase / total length
    trackWidthRatio: 0.821,       // avg track width / total width
    seatToWheelbaseRatio: 0.481,  // seat offset from center / wheelbase
    steeringReach: 0.35,          // horizontal distance from hip to steering wheel
    pedalReach: 0.5,              // horizontal distance from hip to pedals
  },

  // Helper functions for coordinate transformations
  getWorldPosition(componentPosition, kartPosition, kartRotation) {
    // Transform component local coordinates to world coordinates
    // given kart position and rotation in the world
    const cos = Math.cos(kartRotation);
    const sin = Math.sin(kartRotation);

    return {
      x: kartPosition.x + (componentPosition.x * cos - componentPosition.z * sin),
      y: kartPosition.y + componentPosition.y,
      z: kartPosition.z + (componentPosition.x * sin + componentPosition.z * cos),
    };
  },

  getComponentRelativePosition(componentName, anchorPoint = 'frame') {
    // Get position of any component relative to specified anchor
    // anchorPoint can be 'frame', 'seat', 'frontAxle', 'rearAxle'
    const anchors = {
      frame: this.frame.center,
      seat: this.seat.driverHipPoint,
      frontAxle: { x: 0, y: 0, z: 0.52 },
      rearAxle: { x: 0, y: 0, z: -0.52 },
    };

    const anchor = anchors[anchorPoint] || this.frame.center;
    const component = this.getComponentPosition(componentName);

    return {
      x: component.x - anchor.x,
      y: component.y - anchor.y,
      z: component.z - anchor.z,
    };
  },

  getComponentPosition(componentPath) {
    // Get absolute position of any component by path
    // e.g., 'wheels.frontLeft', 'seat', 'steeringWheel'
    const parts = componentPath.split('.');
    let obj = this;

    for (const part of parts) {
      obj = obj[part];
      if (!obj) return null;
    }

    return obj.position || obj;
  },

  validateKartGeometry() {
    // Validate that all components fit within physical constraints
    const issues = [];

    // Check wheel positions
    const flWheel = this.wheels.frontLeft.position;
    const frWheel = this.wheels.frontRight.position;
    const rlWheel = this.wheels.rearLeft.position;
    const rrWheel = this.wheels.rearRight.position;

    const actualWheelbase = flWheel.z - rlWheel.z;
    const actualTrackFront = frWheel.x - flWheel.x;
    const actualTrackRear = rrWheel.x - rlWheel.x;

    if (Math.abs(actualWheelbase - this.wheels.wheelbase) > 0.01) {
      issues.push(`Wheelbase mismatch: ${actualWheelbase} vs ${this.wheels.wheelbase}`);
    }
    if (Math.abs(actualTrackFront - this.wheels.trackWidthFront) > 0.01) {
      issues.push(`Front track mismatch: ${actualTrackFront} vs ${this.wheels.trackWidthFront}`);
    }
    if (Math.abs(actualTrackRear - this.wheels.trackWidthRear) > 0.01) {
      issues.push(`Rear track mismatch: ${actualTrackRear} vs ${this.wheels.trackWidthRear}`);
    }

    // Check that steering wheel is reachable from seat
    const reach = Math.sqrt(
      Math.pow(this.steeringWheel.position.z - this.seat.driverHipPoint.z, 2) +
      Math.pow(this.steeringWheel.position.y - this.seat.driverHipPoint.y, 2)
    );

    if (reach < 0.25 || reach > 0.5) {
      issues.push(`Steering wheel reach questionable: ${reach}m`);
    }

    // Check pedal reach
    const pedalReach = Math.sqrt(
      Math.pow(this.pedals.accelerator.position.z - this.seat.driverHipPoint.z, 2) +
      Math.pow(this.pedals.accelerator.position.y - this.seat.driverHipPoint.y, 2)
    );

    if (pedalReach < 0.4 || pedalReach > 0.7) {
      issues.push(`Pedal reach questionable: ${pedalReach}m`);
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  },
};

// Export convenience functions
export function getWheelPositions() {
  return {
    frontLeft: KartCoordinates.wheels.frontLeft.position,
    frontRight: KartCoordinates.wheels.frontRight.position,
    rearLeft: KartCoordinates.wheels.rearLeft.position,
    rearRight: KartCoordinates.wheels.rearRight.position,
  };
}

export function getCockpitPositions() {
  return {
    seat: KartCoordinates.seat.position,
    steeringWheel: KartCoordinates.steeringWheel.position,
    accelerator: KartCoordinates.pedals.accelerator.position,
    brake: KartCoordinates.pedals.brake.position,
  };
}

export function getKartBounds() {
  // Calculate bounding box for entire kart
  const wheelPositions = getWheelPositions();
  const rearWheelRadius = KartCoordinates.wheels.rearLeft.radius;
  const frontWheelRadius = KartCoordinates.wheels.frontLeft.radius;

  return {
    minX: Math.min(...Object.values(wheelPositions).map(p => p.x)) - rearWheelRadius,
    maxX: Math.max(...Object.values(wheelPositions).map(p => p.x)) + rearWheelRadius,
    minY: 0,
    maxY: KartCoordinates.steeringWheel.position.y + KartCoordinates.steeringWheel.radius,
    minZ: wheelPositions.rearLeft.z - rearWheelRadius,
    maxZ: KartCoordinates.bodywork.nose.position.z,
  };
}
