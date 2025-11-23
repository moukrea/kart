#!/bin/bash
set -e

echo "Installing Autonomous 3D Modeling System..."
echo ""

# Check prerequisites
echo "Checking prerequisites..."

# Check for curl
if ! command -v curl &> /dev/null; then
    echo "ERROR: curl not found. Install with: sudo apt install curl"
    exit 1
fi
echo "  ✓ curl found"

# Check for ImageMagick
if ! command -v convert &> /dev/null; then
    echo "ERROR: ImageMagick not found. Install with: sudo apt install imagemagick"
    exit 1
fi
echo "  ✓ ImageMagick found"

# Check for node (optional, for rendering)
if ! command -v node &> /dev/null; then
    echo "  WARNING: Node.js not found. Some features may not work."
    echo "           Install with: sudo apt install nodejs npm"
    NODE_AVAILABLE=false
else
    echo "  ✓ Node.js found ($(node --version))"
    NODE_AVAILABLE=true
fi

# Check for npm (if node is available)
if [ "$NODE_AVAILABLE" = true ] && ! command -v npm &> /dev/null; then
    echo "  WARNING: npm not found. Install with: sudo apt install npm"
    NPM_AVAILABLE=false
elif [ "$NODE_AVAILABLE" = true ]; then
    echo "  ✓ npm found ($(npm --version))"
    NPM_AVAILABLE=true
else
    NPM_AVAILABLE=false
fi

echo ""

# Create .claude structure
echo "Creating .claude directory structure..."
mkdir -p .claude/commands
echo "  ✓ Created .claude/commands/"

# Check if primitive-modeler exists
if [ ! -d "primitive-modeler" ]; then
    echo ""
    echo "ERROR: primitive-modeler/ directory not found"
    echo "This system requires the primitive-modeler framework"
    exit 1
fi
echo "  ✓ Found primitive-modeler/ framework"

echo ""

# Update .gitignore
echo "Updating .gitignore..."
if [ ! -f ".gitignore" ]; then
    touch .gitignore
    echo "  ✓ Created .gitignore"
fi

# Add .claude/ settings files but NOT .claude/commands/ (commands are shared)
if ! grep -q "^.claude/settings" .gitignore 2>/dev/null; then
    echo ".claude/settings*.json" >> .gitignore
    echo "  ✓ Added .claude/settings*.json to .gitignore"
else
    echo "  ✓ .claude/settings*.json already in .gitignore"
fi

# Ensure .temp is gitignored
if ! grep -q "^.temp" .gitignore 2>/dev/null; then
    echo ".temp" >> .gitignore
    echo "  ✓ Added .temp/ to .gitignore"
else
    echo "  ✓ .temp/ already in .gitignore"
fi

# Ensure node_modules is gitignored
if ! grep -q "^node_modules" .gitignore 2>/dev/null; then
    echo "node_modules" >> .gitignore
    echo "  ✓ Added node_modules/ to .gitignore"
else
    echo "  ✓ node_modules/ already in .gitignore"
fi

echo ""

# Create .temp directory
mkdir -p .temp
echo "Created .temp/ directory for temporary files"

echo ""

# Test ImageMagick
echo "Testing image processing..."
if convert -size 100x100 xc:gray .temp/test.png 2>/dev/null && [ -f .temp/test.png ]; then
    rm .temp/test.png
    echo "  ✓ ImageMagick working correctly"
else
    echo "  ✗ ImageMagick test failed"
    exit 1
fi

echo ""

# Check npm packages (if npm available)
if [ "$NPM_AVAILABLE" = true ]; then
    echo "Checking npm packages..."

    if [ -f "package.json" ]; then
        # Check if three is installed
        if ! npm list three &> /dev/null; then
            echo "  Installing THREE.js..."
            npm install three
            echo "  ✓ THREE.js installed"
        else
            echo "  ✓ THREE.js already installed"
        fi

        # Check if playwright is installed (optional)
        if ! npm list playwright &> /dev/null; then
            echo "  NOTE: Playwright not installed (optional for rendering)"
            echo "        Install with: npm install playwright"
        else
            echo "  ✓ Playwright installed"
        fi
    else
        echo "  No package.json found. Skipping npm packages."
        echo "  You may need to run: npm init -y && npm install three"
    fi
else
    echo "Skipping npm package checks (npm not available)"
fi

echo ""
echo "=========================================="
echo "✓ Installation complete!"
echo "=========================================="
echo ""
echo "Usage:"
echo "  /model <object> <image-url>"
echo ""
echo "Examples:"
echo "  /model kart https://example.com/kart.jpg"
echo "  /model \"sports car\" ./reference.png"
echo "  /model chair https://... --interactive"
echo ""
echo "Documentation:"
echo "  System docs:    .claude/README.md"
echo "  Framework docs: primitive-modeler/README.md"
echo "  Commands:       .claude/commands/"
echo ""
echo "Next steps:"
echo "  1. Review .claude/README.md for usage"
echo "  2. Try: /model <object> <reference-image>"
echo "  3. Check primitive-modeler/README.md for API details"
echo ""
