#!/bin/bash

# Kart Visual Test Runner
# Quick script to run Playwright visual tests with various modes

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Change to project root
cd "$(dirname "$0")/.."

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Kart Visual Testing with Playwright${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Parse command line arguments
MODE="${1:-headless}"

case "$MODE" in
  "headless")
    echo -e "${GREEN}Running tests in headless mode...${NC}"
    npx playwright test
    ;;

  "headed")
    echo -e "${GREEN}Running tests in headed mode...${NC}"
    npx playwright test --headed
    ;;

  "slow")
    echo -e "${GREEN}Running tests in slow-mo mode (500ms delay)...${NC}"
    npx playwright test --headed --slow-mo=500
    ;;

  "debug")
    echo -e "${GREEN}Running tests in debug mode with inspector...${NC}"
    npx playwright test --debug
    ;;

  "ui")
    echo -e "${GREEN}Opening Playwright UI mode...${NC}"
    npx playwright test --ui
    ;;

  "report")
    echo -e "${GREEN}Opening test report...${NC}"
    npx playwright show-report
    ;;

  "clean")
    echo -e "${YELLOW}Cleaning test artifacts...${NC}"
    rm -rf .temp/screenshots/*
    rm -rf playwright-report/
    rm -rf test-results/
    echo -e "${GREEN}Cleanup complete!${NC}"
    exit 0
    ;;

  "help"|"-h"|"--help")
    echo "Usage: $0 [mode]"
    echo ""
    echo "Available modes:"
    echo "  headless  - Run tests in headless mode (default)"
    echo "  headed    - Run tests with visible browser"
    echo "  slow      - Run tests with 500ms slow motion"
    echo "  debug     - Run tests with Playwright Inspector"
    echo "  ui        - Open interactive UI mode"
    echo "  report    - Open HTML test report"
    echo "  clean     - Remove test artifacts and screenshots"
    echo "  help      - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0              # Run headless"
    echo "  $0 headed       # Watch tests run"
    echo "  $0 slow         # Visual inspection with slow motion"
    echo "  $0 debug        # Step through tests"
    echo "  $0 clean        # Clean up artifacts"
    exit 0
    ;;

  *)
    echo -e "${YELLOW}Unknown mode: $MODE${NC}"
    echo "Run '$0 help' for available modes"
    exit 1
    ;;
esac

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Test execution complete!${NC}"
echo ""
echo "Screenshots saved to: .temp/screenshots/"
echo ""
echo "To view results:"
echo "  - Screenshots: xdg-open .temp/screenshots/"
echo "  - HTML Report: $0 report"
echo ""
echo -e "${BLUE}========================================${NC}"
