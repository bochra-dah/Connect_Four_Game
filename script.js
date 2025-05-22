
const ROWS = 6;
const COLS = 7;
let board;
let currentPlayer;
const boardDiv = document.getElementById('board');
const message = document.getElementById('message');
const restartButton = document.getElementById('restart');

function initGame() {
  board = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
  currentPlayer = 1;
  boardDiv.style.pointerEvents = 'auto';
  message.textContent = '';
  renderBoard();
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

function getValidMoves() {
  return [...Array(COLS).keys()].filter(c => board[0][c] === 0);
}

function simpleAIMove() {
  const moves = getValidMoves();
  return moves[Math.floor(Math.random() * moves.length)];
}

function nextTurn() {
  renderBoard();
  if (checkWinner(currentPlayer)) {
    message.textContent = `Player ${currentPlayer} wins!`;
    boardDiv.style.pointerEvents = 'none';
    return;
  }
  if (isDraw()) {
    message.textContent = "It's a draw!";
    return;
  }
  currentPlayer = currentPlayer === 1 ? 2 : 1;
  if (currentPlayer === 2) {
    setTimeout(() => {
      const aiCol = simpleAIMove();
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

restartButton.addEventListener('click', initGame);

initGame();
