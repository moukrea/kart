import { exec } from 'child_process';
import { promises as fs } from 'fs';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Downloads an image from URL to local path
 * @param {string} url - Image URL
 * @param {string} outputPath - Local save path
 * @returns {Promise<void>}
 */
export async function downloadImage(url, outputPath) {
    try {
        await execAsync(`curl -L -o "${outputPath}" "${url}"`);

        const stats = await fs.stat(outputPath);
        if (stats.size === 0) {
            throw new Error('Downloaded file is empty');
        }
    } catch (error) {
        throw new Error(`Failed to download image: ${error.message}`);
    }
}

/**
 * Gets image dimensions using ImageMagick
 * @param {string} imagePath - Path to image
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageDimensions(imagePath) {
    try {
        const { stdout } = await execAsync(`identify -format "%w %h" "${imagePath}"`);
        const [width, height] = stdout.trim().split(' ').map(Number);

        if (!width || !height || isNaN(width) || isNaN(height)) {
            throw new Error('Invalid dimensions returned from identify');
        }

        return { width, height };
    } catch (error) {
        throw new Error(`Failed to get image dimensions: ${error.message}`);
    }
}

/**
 * Analyzes image composition to detect model sheets
 * @param {string} imagePath - Path to image
 * @returns {Promise<{isModelSheet: boolean, dimensions: Object, regions: Array}>}
 */
export async function analyzeImageComposition(imagePath) {
    const dimensions = await getImageDimensions(imagePath);

    const edgesPath = imagePath.replace(/\.(jpg|png)$/i, '_edges.png');
    try {
        await execAsync(`convert "${imagePath}" -edge 1 -threshold 50% "${edgesPath}"`);
    } catch (error) {
        throw new Error(`Failed to analyze image composition: ${error.message}`);
    }

    const aspectRatio = dimensions.width / dimensions.height;

    const isLikelyModelSheet = aspectRatio > 2.0 || (aspectRatio > 0.8 && aspectRatio < 1.2 && dimensions.width > 1500);

    let regions = [];
    if (isLikelyModelSheet) {
        const numViews = Math.round(aspectRatio);
        const viewWidth = Math.floor(dimensions.width / numViews);

        for (let i = 0; i < numViews; i++) {
            regions.push({
                x: i * viewWidth,
                y: 0,
                width: viewWidth,
                height: dimensions.height,
                estimatedView: ['front', 'side', 'top', 'back'][i % 4]
            });
        }
    } else {
        regions.push({
            x: 0,
            y: 0,
            width: dimensions.width,
            height: dimensions.height,
            estimatedView: 'front'
        });
    }

    await fs.unlink(edgesPath).catch(() => {});

    return {
        isModelSheet: isLikelyModelSheet,
        dimensions,
        regions
    };
}

/**
 * Splits a model sheet into individual views
 * @param {string} imagePath - Path to model sheet image
 * @param {Array} regions - Regions to extract
 * @param {string} outputPrefix - Output path prefix
 * @returns {Promise<Array<string>>} - Paths to extracted views
 */
export async function splitModelSheet(imagePath, regions, outputPrefix) {
    const outputPaths = [];

    for (let i = 0; i < regions.length; i++) {
        const region = regions[i];
        const outputPath = `${outputPrefix}-${region.estimatedView || i}.jpg`;

        const cropGeometry = `${region.width}x${region.height}+${region.x}+${region.y}`;

        try {
            await execAsync(`convert "${imagePath}" -crop ${cropGeometry} "${outputPath}"`);
            outputPaths.push(outputPath);
        } catch (error) {
            throw new Error(`Failed to split model sheet at region ${i}: ${error.message}`);
        }
    }

    return outputPaths;
}

/**
 * Classifies view angle from image
 * @param {string} imagePath - Path to image
 * @param {string} filename - Original filename
 * @returns {Promise<string>} - View type (front/back/left/right/top/bottom/perspective)
 */
export async function classifyView(imagePath, filename = '') {
    const lowerName = filename.toLowerCase();

    if (lowerName.includes('front')) return 'front';
    if (lowerName.includes('back') || lowerName.includes('rear')) return 'back';
    if (lowerName.includes('left')) return 'left';
    if (lowerName.includes('right')) return 'right';
    if (lowerName.includes('top') || lowerName.includes('above')) return 'top';
    if (lowerName.includes('bottom') || lowerName.includes('below')) return 'bottom';
    if (lowerName.includes('perspective') || lowerName.includes('3d') || lowerName.includes('angle')) return 'perspective';
    if (lowerName.includes('side')) {
        return 'left';
    }

    try {
        const dimensions = await getImageDimensions(imagePath);
        const aspectRatio = dimensions.width / dimensions.height;

        if (aspectRatio > 1.3) {
            return 'left';
        } else if (aspectRatio < 0.7) {
            return 'front';
        } else if (aspectRatio > 0.9 && aspectRatio < 1.1) {
            return 'top';
        }
    } catch (error) {
        console.error(`Failed to analyze image for view classification: ${error.message}`);
    }

    return 'front';
}

/**
 * Extracts edges from image for measurement
 * @param {string} imagePath - Path to image
 * @param {string} outputPath - Path for edge image
 * @returns {Promise<void>}
 */
export async function extractEdges(imagePath, outputPath) {
    try {
        await execAsync(`convert "${imagePath}" -canny 0x1+10%+30% "${outputPath}"`);
    } catch (error) {
        throw new Error(`Failed to extract edges: ${error.message}`);
    }
}

/**
 * Calculates proportions from image (simplified)
 * @param {string} imagePath - Path to image
 * @returns {Promise<Object>} - Measurement object
 */
export async function calculateProportions(imagePath) {
    const dimensions = await getImageDimensions(imagePath);

    const edgesPath = imagePath.replace(/\.(jpg|png)$/i, '_measure_edges.png');

    try {
        await extractEdges(imagePath, edgesPath);
    } catch (error) {
        console.error(`Edge extraction failed during proportion calculation: ${error.message}`);
    }

    const measurements = {
        overall: {
            width: 1.0,
            height: dimensions.height / dimensions.width,
            depth: 0.8
        },
        features: [],
        confidence: 0.7
    };

    await fs.unlink(edgesPath).catch(() => {});

    return measurements;
}

/**
 * Copies local image to temp directory
 * @param {string} sourcePath - Source image path
 * @param {string} destPath - Destination path
 * @returns {Promise<void>}
 */
export async function copyLocalImage(sourcePath, destPath) {
    try {
        await fs.copyFile(sourcePath, destPath);
    } catch (error) {
        throw new Error(`Failed to copy image: ${error.message}`);
    }
}

/**
 * Validates image file exists and is readable
 * @param {string} imagePath - Path to check
 * @returns {Promise<boolean>}
 */
export async function validateImage(imagePath) {
    try {
        const stats = await fs.stat(imagePath);
        return stats.isFile() && stats.size > 0;
    } catch {
        return false;
    }
}
