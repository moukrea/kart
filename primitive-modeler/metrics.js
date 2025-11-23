/**
 * Metrics Analysis Module for Primitive 3D Modeling System
 * Provides image comparison, feature analysis, and convergence detection
 */

/**
 * Extract ImageData from a canvas element
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {ImageData} Image data from canvas
 */
export function canvasToImageData(canvas) {
    const ctx = canvas.getContext('2d');
    return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

/**
 * Create a canvas from ImageData
 * @param {ImageData} imageData - Source image data
 * @returns {HTMLCanvasElement} Canvas containing the image
 */
export function imageDataToCanvas(imageData) {
    const canvas = document.createElement('canvas');
    canvas.width = imageData.width;
    canvas.height = imageData.height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas;
}

/**
 * Convert canvas to grayscale
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {ImageData} Grayscale image data
 */
export function canvasToGrayscale(canvas) {
    const imageData = canvasToImageData(canvas);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
    }

    return imageData;
}

/**
 * Apply binary threshold to create silhouette
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @param {number} threshold - Threshold value (0-255)
 * @returns {ImageData} Binary image data
 */
export function applyThreshold(canvas, threshold = 128) {
    const gray = canvasToGrayscale(canvas);
    const data = gray.data;

    for (let i = 0; i < data.length; i += 4) {
        const binary = data[i] > threshold ? 255 : 0;
        data[i] = binary;
        data[i + 1] = binary;
        data[i + 2] = binary;
    }

    return gray;
}

/**
 * Apply Sobel edge detection
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {ImageData} Edge-detected image data
 */
export function sobelEdgeDetect(canvas) {
    const gray = canvasToGrayscale(canvas);
    const width = gray.width;
    const height = gray.height;
    const src = gray.data;
    const dst = new Uint8ClampedArray(src.length);

    const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
    const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];

    for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
            let gx = 0;
            let gy = 0;

            for (let ky = -1; ky <= 1; ky++) {
                for (let kx = -1; kx <= 1; kx++) {
                    const idx = ((y + ky) * width + (x + kx)) * 4;
                    const kernelIdx = (ky + 1) * 3 + (kx + 1);
                    const pixel = src[idx];
                    gx += pixel * sobelX[kernelIdx];
                    gy += pixel * sobelY[kernelIdx];
                }
            }

            const magnitude = Math.sqrt(gx * gx + gy * gy);
            const idx = (y * width + x) * 4;
            dst[idx] = dst[idx + 1] = dst[idx + 2] = Math.min(255, magnitude);
            dst[idx + 3] = 255;
        }
    }

    return new ImageData(dst, width, height);
}

/**
 * Calculate Intersection over Union for silhouettes
 * @param {HTMLCanvasElement} renderCanvas - Rendered model canvas
 * @param {HTMLCanvasElement} refCanvas - Reference image canvas
 * @returns {Object} IoU metrics including score, intersection, union, and overlap
 */
export function calculateSilhouetteIoU(renderCanvas, refCanvas) {
    if (renderCanvas.width !== refCanvas.width || renderCanvas.height !== refCanvas.height) {
        throw new Error('Canvas dimensions must match');
    }

    const render = applyThreshold(renderCanvas, 128);
    const ref = applyThreshold(refCanvas, 128);

    const renderData = render.data;
    const refData = ref.data;

    let intersection = 0;
    let union = 0;
    let renderArea = 0;
    let refArea = 0;

    for (let i = 0; i < renderData.length; i += 4) {
        const renderPixel = renderData[i] > 0;
        const refPixel = refData[i] > 0;

        if (renderPixel) renderArea++;
        if (refPixel) refArea++;

        if (renderPixel && refPixel) {
            intersection++;
        }
        if (renderPixel || refPixel) {
            union++;
        }
    }

    const iou = union > 0 ? intersection / union : 0;
    const overlapPercentage = refArea > 0 ? (intersection / refArea) * 100 : 0;

    return {
        iou: parseFloat(iou.toFixed(4)),
        intersection,
        union,
        renderArea,
        refArea,
        overlapPercentage: parseFloat(overlapPercentage.toFixed(2))
    };
}

/**
 * Detect edge misalignment between two images
 * @param {HTMLCanvasElement} renderCanvas - Rendered model canvas
 * @param {HTMLCanvasElement} refCanvas - Reference image canvas
 * @returns {Object} Edge alignment metrics
 */
export function detectEdgeMisalignment(renderCanvas, refCanvas) {
    if (renderCanvas.width !== refCanvas.width || renderCanvas.height !== refCanvas.height) {
        throw new Error('Canvas dimensions must match');
    }

    const renderEdges = sobelEdgeDetect(renderCanvas);
    const refEdges = sobelEdgeDetect(refCanvas);

    const renderData = renderEdges.data;
    const refData = refEdges.data;

    let totalEdgePixels = 0;
    let matchingEdgePixels = 0;
    let totalDistance = 0;
    let edgeThreshold = 50;

    for (let i = 0; i < renderData.length; i += 4) {
        const renderEdge = renderData[i] > edgeThreshold;
        const refEdge = refData[i] > edgeThreshold;

        if (refEdge) {
            totalEdgePixels++;
            if (renderEdge) {
                matchingEdgePixels++;
            } else {
                totalDistance += Math.abs(renderData[i] - refData[i]);
            }
        }
    }

    const coverage = totalEdgePixels > 0 ? (matchingEdgePixels / totalEdgePixels) * 100 : 0;
    const avgDistance = totalEdgePixels > 0 ? totalDistance / totalEdgePixels : 0;
    const alignmentScore = parseFloat((coverage / 100).toFixed(4));

    return {
        alignmentScore,
        averageEdgeDistance: parseFloat(avgDistance.toFixed(2)),
        edgeCoveragePercentage: parseFloat(coverage.toFixed(2)),
        totalEdgePixels,
        matchingEdgePixels
    };
}

/**
 * Calculate pixel-wise difference with RMSE
 * @param {HTMLCanvasElement} renderCanvas - Rendered model canvas
 * @param {HTMLCanvasElement} refCanvas - Reference image canvas
 * @returns {Object} Difference metrics including RMSE and heatmap
 */
export function calculatePixelDifference(renderCanvas, refCanvas) {
    if (renderCanvas.width !== refCanvas.width || renderCanvas.height !== refCanvas.height) {
        throw new Error('Canvas dimensions must match');
    }

    const renderData = canvasToImageData(renderCanvas).data;
    const refData = canvasToImageData(refCanvas).data;
    const width = renderCanvas.width;
    const height = renderCanvas.height;

    let sumSquaredError = 0;
    let maxDiff = 0;
    const diffMap = new Uint8ClampedArray(renderData.length);

    for (let i = 0; i < renderData.length; i += 4) {
        const rDiff = renderData[i] - refData[i];
        const gDiff = renderData[i + 1] - refData[i + 1];
        const bDiff = renderData[i + 2] - refData[i + 2];

        const pixelDiff = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
        sumSquaredError += pixelDiff * pixelDiff;
        maxDiff = Math.max(maxDiff, pixelDiff);

        diffMap[i] = diffMap[i + 1] = diffMap[i + 2] = Math.min(255, pixelDiff);
        diffMap[i + 3] = 255;
    }

    const totalPixels = (renderData.length / 4);
    const rmse = Math.sqrt(sumSquaredError / totalPixels);
    const normalizedRMSE = rmse / 255;

    return {
        rmse: parseFloat(rmse.toFixed(4)),
        normalizedRMSE: parseFloat(normalizedRMSE.toFixed(4)),
        maxDifference: parseFloat(maxDiff.toFixed(2)),
        differenceHeatmap: new ImageData(diffMap, width, height)
    };
}

/**
 * Generate color-coded heatmap of differences
 * @param {HTMLCanvasElement} renderCanvas - Rendered model canvas
 * @param {HTMLCanvasElement} refCanvas - Reference image canvas
 * @returns {ImageData} Color heatmap (blue=match, yellow=small diff, red=large diff)
 */
export function generateHeatmap(renderCanvas, refCanvas) {
    if (renderCanvas.width !== refCanvas.width || renderCanvas.height !== refCanvas.height) {
        throw new Error('Canvas dimensions must match');
    }

    const renderData = canvasToImageData(renderCanvas).data;
    const refData = canvasToImageData(refCanvas).data;
    const width = renderCanvas.width;
    const height = renderCanvas.height;

    const heatmap = new Uint8ClampedArray(renderData.length);

    for (let i = 0; i < renderData.length; i += 4) {
        const rDiff = renderData[i] - refData[i];
        const gDiff = renderData[i + 1] - refData[i + 1];
        const bDiff = renderData[i + 2] - refData[i + 2];

        const pixelDiff = Math.sqrt(rDiff * rDiff + gDiff * gDiff + bDiff * bDiff);
        const normalizedDiff = Math.min(1, pixelDiff / 255);

        // Blue (match) -> Green -> Yellow (medium) -> Red (large diff)
        let r, g, b;
        if (normalizedDiff < 0.25) {
            // Blue to cyan
            r = 0;
            g = normalizedDiff * 4 * 255;
            b = 255;
        } else if (normalizedDiff < 0.5) {
            // Cyan to green
            r = 0;
            g = 255;
            b = 255 - (normalizedDiff - 0.25) * 4 * 255;
        } else if (normalizedDiff < 0.75) {
            // Green to yellow
            r = (normalizedDiff - 0.5) * 4 * 255;
            g = 255;
            b = 0;
        } else {
            // Yellow to red
            r = 255;
            g = 255 - (normalizedDiff - 0.75) * 4 * 255;
            b = 0;
        }

        heatmap[i] = r;
        heatmap[i + 1] = g;
        heatmap[i + 2] = b;
        heatmap[i + 3] = 255;
    }

    return new ImageData(heatmap, width, height);
}

/**
 * Count visual features using edge density analysis
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {Object} Feature count and density information
 */
export function countVisualFeatures(canvas) {
    const edges = sobelEdgeDetect(canvas);
    const data = edges.data;
    const width = canvas.width;
    const height = canvas.height;

    const edgeThreshold = 50;
    const blockSize = 16;
    const blocksX = Math.ceil(width / blockSize);
    const blocksY = Math.ceil(height / blockSize);

    const densityMap = new Array(blocksY).fill(0).map(() => new Array(blocksX).fill(0));

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const idx = (y * width + x) * 4;
            if (data[idx] > edgeThreshold) {
                const blockX = Math.floor(x / blockSize);
                const blockY = Math.floor(y / blockSize);
                densityMap[blockY][blockX]++;
            }
        }
    }

    let activeBlocks = 0;
    let maxDensity = 0;
    let totalEdgeDensity = 0;

    for (let by = 0; by < blocksY; by++) {
        for (let bx = 0; bx < blocksX; bx++) {
            const density = densityMap[by][bx];
            if (density > 10) {
                activeBlocks++;
            }
            maxDensity = Math.max(maxDensity, density);
            totalEdgeDensity += density;
        }
    }

    const avgDensity = totalEdgeDensity / (blocksX * blocksY);
    const featureEstimate = Math.ceil(activeBlocks / 4);

    return {
        featureCount: featureEstimate,
        activeBlocks,
        totalBlocks: blocksX * blocksY,
        averageDensity: parseFloat(avgDensity.toFixed(2)),
        maxDensity,
        densityMap
    };
}

/**
 * Analyze image symmetry
 * @param {HTMLCanvasElement} canvas - Source canvas
 * @returns {Object} Symmetry scores for horizontal and vertical axes
 */
export function analyzeSymmetry(canvas) {
    const imageData = canvasToImageData(canvas);
    const data = imageData.data;
    const width = canvas.width;
    const height = canvas.height;

    let horizontalDiff = 0;
    let verticalDiff = 0;
    let horizontalPixels = 0;
    let verticalPixels = 0;

    // Left-right symmetry
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < Math.floor(width / 2); x++) {
            const leftIdx = (y * width + x) * 4;
            const rightIdx = (y * width + (width - 1 - x)) * 4;

            const diff = Math.abs(data[leftIdx] - data[rightIdx]) +
                        Math.abs(data[leftIdx + 1] - data[rightIdx + 1]) +
                        Math.abs(data[leftIdx + 2] - data[rightIdx + 2]);

            horizontalDiff += diff;
            horizontalPixels++;
        }
    }

    // Top-bottom symmetry
    for (let y = 0; y < Math.floor(height / 2); y++) {
        for (let x = 0; x < width; x++) {
            const topIdx = (y * width + x) * 4;
            const bottomIdx = ((height - 1 - y) * width + x) * 4;

            const diff = Math.abs(data[topIdx] - data[bottomIdx]) +
                        Math.abs(data[topIdx + 1] - data[bottomIdx + 1]) +
                        Math.abs(data[topIdx + 2] - data[bottomIdx + 2]);

            verticalDiff += diff;
            verticalPixels++;
        }
    }

    const horizontalSymmetry = 1 - (horizontalDiff / (horizontalPixels * 255 * 3));
    const verticalSymmetry = 1 - (verticalDiff / (verticalPixels * 255 * 3));

    return {
        horizontalSymmetry: parseFloat(Math.max(0, horizontalSymmetry).toFixed(4)),
        verticalSymmetry: parseFloat(Math.max(0, verticalSymmetry).toFixed(4)),
        isSymmetricHorizontal: horizontalSymmetry > 0.85,
        isSymmetricVertical: verticalSymmetry > 0.85
    };
}

/**
 * Assess whether metrics have converged to target thresholds
 * @param {Object} currentMetrics - Current metric values (iou, edgeAlign, rmse)
 * @param {Object} targetThresholds - Target threshold values
 * @returns {Object} Convergence status and detailed report
 */
export function assessConvergence(currentMetrics, targetThresholds) {
    const defaults = {
        iou: 0.85,
        edgeAlign: 0.90,
        rmse: 0.15
    };

    const thresholds = { ...defaults, ...targetThresholds };
    const failingCriteria = [];

    if (currentMetrics.iou < thresholds.iou) {
        failingCriteria.push({
            metric: 'iou',
            current: currentMetrics.iou,
            target: thresholds.iou,
            difference: parseFloat((thresholds.iou - currentMetrics.iou).toFixed(4))
        });
    }

    if (currentMetrics.edgeAlign < thresholds.edgeAlign) {
        failingCriteria.push({
            metric: 'edgeAlign',
            current: currentMetrics.edgeAlign,
            target: thresholds.edgeAlign,
            difference: parseFloat((thresholds.edgeAlign - currentMetrics.edgeAlign).toFixed(4))
        });
    }

    if (currentMetrics.rmse > thresholds.rmse) {
        failingCriteria.push({
            metric: 'rmse',
            current: currentMetrics.rmse,
            target: thresholds.rmse,
            difference: parseFloat((currentMetrics.rmse - thresholds.rmse).toFixed(4))
        });
    }

    const converged = failingCriteria.length === 0;
    const convergencePercentage = ((3 - failingCriteria.length) / 3) * 100;

    return {
        converged,
        convergencePercentage: parseFloat(convergencePercentage.toFixed(2)),
        failingCriteria,
        passingCriteria: 3 - failingCriteria.length,
        totalCriteria: 3
    };
}

/**
 * Suggest next steps based on metric trends
 * @param {Object} currentMetrics - Current iteration metrics
 * @param {Object} previousMetrics - Previous iteration metrics
 * @returns {Object} Improvement analysis and prioritized suggestions
 */
export function suggestNextSteps(currentMetrics, previousMetrics) {
    const suggestions = [];
    const improvements = {};
    const degradations = {};

    // Analyze IoU trend
    if (previousMetrics.iou !== undefined) {
        const iouChange = currentMetrics.iou - previousMetrics.iou;
        improvements.iou = iouChange;

        if (iouChange < -0.05) {
            suggestions.push({
                priority: 1,
                focus: 'silhouette',
                message: 'Silhouette match degraded significantly. Review overall shape and proportions.',
                metric: 'iou',
                change: iouChange
            });
        } else if (currentMetrics.iou < 0.85 && iouChange >= 0) {
            suggestions.push({
                priority: 2,
                focus: 'silhouette',
                message: 'Continue improving silhouette match. Consider adjusting primitive scales and positions.',
                metric: 'iou',
                change: iouChange
            });
        }
    }

    // Analyze edge alignment trend
    if (previousMetrics.edgeAlign !== undefined) {
        const edgeChange = currentMetrics.edgeAlign - previousMetrics.edgeAlign;
        improvements.edgeAlign = edgeChange;

        if (edgeChange < -0.05) {
            suggestions.push({
                priority: 1,
                focus: 'edges',
                message: 'Edge alignment worsened. Refine primitive boundaries and add detail primitives.',
                metric: 'edgeAlign',
                change: edgeChange
            });
        } else if (currentMetrics.edgeAlign < 0.90 && edgeChange >= 0) {
            suggestions.push({
                priority: 2,
                focus: 'edges',
                message: 'Improve edge detail. Add smaller primitives for fine features.',
                metric: 'edgeAlign',
                change: edgeChange
            });
        }
    }

    // Analyze RMSE trend
    if (previousMetrics.rmse !== undefined) {
        const rmseChange = currentMetrics.rmse - previousMetrics.rmse;
        improvements.rmse = -rmseChange; // Lower is better

        if (rmseChange > 0.05) {
            suggestions.push({
                priority: 1,
                focus: 'details',
                message: 'Pixel-level accuracy decreased. Review recent changes and consider reverting.',
                metric: 'rmse',
                change: rmseChange
            });
        } else if (currentMetrics.rmse > 0.15 && rmseChange <= 0) {
            suggestions.push({
                priority: 3,
                focus: 'details',
                message: 'Fine-tune colors, materials, and lighting to reduce pixel differences.',
                metric: 'rmse',
                change: rmseChange
            });
        }
    }

    // Sort by priority
    suggestions.sort((a, b) => a.priority - b.priority);

    const isImproving = Object.values(improvements).filter(v => v > 0).length >= 2;
    const isDegrading = Object.values(improvements).filter(v => v < -0.01).length >= 2;

    return {
        suggestions: suggestions.map(s => s.message),
        detailedSuggestions: suggestions,
        isImproving,
        isDegrading,
        improvements,
        overallTrend: isImproving ? 'improving' : isDegrading ? 'degrading' : 'stable'
    };
}
