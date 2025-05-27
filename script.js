const ROWS = 6;
const COLS = 7;
let board;
let currentPlayer;
let startTime;
const aiDepth = 6; // Fixed depth

const boardDiv = document.getElementById('board');
const message = document.getElementById('message');
const timer = document.getElementById('timer');
const restartButton = document.getElementById('restart');
const startHumanButton = document.getElementById('start-human');
const startAIButton = document.getElementById('start-ai');

function initGame(starter = 1) {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = starter;
  boardDiv.style.pointerEvents = 'auto';
  message.textContent = '';
  timer.textContent = '';
  renderBoard();
  startTime = Date.now();
  if (currentPlayer === 2) {
    setTimeout(() => {
      const aiCol = getBestMoveMinimax();
      makeMove(aiCol);
      nextTurn();
    }, 500);
  }
}

function renderBoard() {
  boardDiv.innerHTML = '';
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement('div');
      cell.classList.add('cell');
      if (board[r][c] === 1) cell.classList.add('player1');
      if (board[r][c] === 2) cell.classList.add('player2');
      cell.dataset.col = c;
      boardDiv.appendChild(cell);
    }
  }
}

function makeMove(col) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === 0) {
      board[r][col] = currentPlayer;
      return true;
    }
  }
  return false;
}

function checkWinner(player) {
  const directions = [
    [0, 1], [1, 0], [1, 1], [1, -1]
  ];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      if (board[r][c] !== player) continue;
      for (let [dr, dc] of directions) {
        let win = true;
        for (let i = 1; i < 4; i++) {
          const nr = r + dr * i;
          const nc = c + dc * i;
          if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS || board[nr][nc] !== player) {
            win = false;
            break;
          }
        }
        if (win) return true;
      }
    }
  }
  return false;
}

function isDraw() {
  return board.flat().every(cell => cell !== 0);
}

function getValidMoves(b) {
  return [...Array(COLS).keys()].filter(c => b[0][c] === 0);
}

function evaluateBoard(b, player) {
  const opponent = player === 1 ? 2 : 1;
  let score = 0;
  const centerArray = b.map(r => r[Math.floor(COLS / 2)]);
  score += centerArray.filter(val => val === player).length * 3;
  return score;
}

function minimax(b, depth, alpha, beta, maximizing, player) {
  const opponent = player === 1 ? 2 : 1;
  if (checkWinner(opponent)) return [maximizing ? -1000 : 1000, null];
  if (depth === 0 || isDraw()) return [evaluateBoard(b, player), null];
  const validMoves = getValidMoves(b);
  let bestCol = validMoves[0];

  if (maximizing) {
    let maxEval = -Infinity;
    for (let col of validMoves) {
      const newBoard = b.map(row => row.slice());
      makeMoveTemp(newBoard, col, player);
      const [evalScore] = minimax(newBoard, depth - 1, alpha, beta, false, player);
      if (evalScore > maxEval) {
        maxEval = evalScore;
        bestCol = col;
      }
      alpha = Math.max(alpha, evalScore);
      if (beta <= alpha) break;
    }
    return [maxEval, bestCol];
  } else {
    let minEval = Infinity;
    for (let col of validMoves) {
      const newBoard = b.map(row => row.slice());
      makeMoveTemp(newBoard, col, opponent);
      const [evalScore] = minimax(newBoard, depth - 1, alpha, beta, true, player);
      if (evalScore < minEval) {
        minEval = evalScore;
        bestCol = col;
      }
      beta = Math.min(beta, evalScore);
      if (beta <= alpha) break;
    }
    return [minEval, bestCol];
  }
}

function makeMoveTemp(b, col, player) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (b[r][col] === 0) {
      b[r][col] = player;
      return;
    }
  }
}

function getBestMoveMinimax() {
  const [, move] = minimax(board, aiDepth, -Infinity, Infinity, true, 2);
  return move;
}

function endGame(winner) {
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(2);
  message.textContent = winner ? `Player ${winner} wins!` : "It's a draw!";
  timer.textContent = `Game duration: ${elapsed} seconds`;
  boardDiv.style.pointerEvents = 'none';
}

function nextTurn() {
  renderBoard();
  if (checkWinner(currentPlayer)) {
    endGame(currentPlayer);
    return;
  }
  if (isDraw()) {
    endGame(null);
    return;
  }
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  if (currentPlayer === 2) {
    setTimeout(() => {
      const aiCol = getBestMoveMinimax();
      makeMove(aiCol);
      nextTurn();
    }, 500);
  }
}

boardDiv.addEventListener('click', (e) => {
  if (currentPlayer !== 1) return;
  const col = parseInt(e.target.dataset.col);
  if (isNaN(col)) return;
  if (!makeMove(col)) return;
  nextTurn();
});

restartButton.addEventListener('click', () => initGame(currentPlayer));
startHumanButton.addEventListener('click', () => initGame(1));
startAIButton.addEventListener('click', () => initGame(2));

initGame();
