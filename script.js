// Cursor blinking effect (kept from original code)
const cur = document.querySelector("#cur");
let i = 0;

function showcur() {
  if (cur) cur.innerText = "_";
  i++;
  setTimeout(hidecur, 500);
}

function hidecur() {
  if (cur) cur.innerText = "";
  if (i < 100) setTimeout(showcur, 500);
}

showcur();

// --- Conway's Game of Life Canvas Setup ---
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

// Canvas styling to sit in the background
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100vw';
canvas.style.height = '100vh';
canvas.style.zIndex = '-1';
canvas.style.pointerEvents = 'none';

const cellSize = 15; // Grid cell size in pixels
let cols, rows;
let grid, nextGrid;

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  cols = Math.floor(canvas.width / cellSize);
  rows = Math.floor(canvas.height / cellSize);

  grid = createGrid();
  nextGrid = createGrid();
}

function createGrid() {
  return Array.from({ length: cols }, () => new Uint8Array(rows));
}

// Compute neighbor count for Conway's rules
function countNeighbors(grid, x, y) {
  let sum = 0;
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      if (i === 0 && j === 0) continue;
      const col = (x + i + cols) % cols;
      const row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  return sum;
}

// Game loop update step
function updateGrid() {
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      const state = grid[x][y];
      const neighbors = countNeighbors(grid, x, y);

      if (state === 0 && neighbors === 3) {
        nextGrid[x][y] = 1; // Cell born
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        nextGrid[x][y] = 0; // Cell dies
      } else {
        nextGrid[x][y] = state; // Cell survives
      }
    }
  }

  // Swap grids
  const temp = grid;
  grid = nextGrid;
  nextGrid = temp;
}

// Render grid to background canvas
function drawGrid() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  
  for (let x = 0; x < cols; x++) {
    for (let y = 0; y < rows; y++) {
      if (grid[x][y] === 1) {
        ctx.fillStyle = '#d3d3d3'; // Light grey active boxes
        ctx.fillRect(x * cellSize, y * cellSize, cellSize - 1, cellSize - 1);
      }
    }
  }
}

// Main animation loop (throttled to ~15 FPS for classic Game of Life speed)
let lastTime = 0;
const fpsInterval = 1000 / 15;

function animate(currentTime) {
  requestAnimationFrame(animate);

  const elapsed = currentTime - lastTime;
  if (elapsed > fpsInterval) {
    lastTime = currentTime - (elapsed % fpsInterval);
    updateGrid();
    drawGrid();
  }
}

// Activate cells on mouse movement
document.addEventListener('mousemove', (e) => {
  const col = Math.floor(e.clientX / cellSize);
  const row = Math.floor(e.clientY / cellSize);

  // Activate target cell and its immediate neighbors for a splash effect
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      const c = (col + dx + cols) % cols;
      const r = (row + dy + rows) % rows;
      grid[c][r] = 1;
    }
  }
});

// Window resize handler
window.addEventListener('resize', resizeCanvas);

// Initialize and start simulation
resizeCanvas();
requestAnimationFrame(animate);
