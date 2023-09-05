// @ts-nocheck
import process from "node:process";
import readline from "readline";
import chalk from "chalk";

const WIDTH = 20;
var HEIGHT = 40;
const SQUARE_CHAR = "██";
var SPEED = 600;
const { log, clear } = console;

var FIGURES = [
  [
    [0, 1, 0],
    [0, 1, 0],
    [1, 1, 0],
  ],
  [
    [false, 1, 0],
    [false, 1, 0],
    [false, 1, 1],
  ],
  [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  [
    [1, 1],
    [1, 1],
  ],
  [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
];

const board = [];
let x = 0;
let y = 0;
let figure = FIGURES[0];
let score = 0;

for (var i = 0; i < HEIGHT; i++) {
  board[i] = [];
  for (var j = 0; j < WIDTH; j++) {
    board[i][j] = 0;
  }
}

var nextFigure = (Math.random() * FIGURES.length) | 0;

var generateNewFigure = function () {
  figure = FIGURES[nextFigure];
  nextFigure = (Math.random() * FIGURES.length) | 0;
  y = -figure.length;
  x = (WIDTH / 2 - figure.length / 2) | 0;

  var btm = figure.length - 1;

  while (isAllEmpty(figure[btm])) {
    y++;
    btm--;
  }
};

var clearCompletedLines = function () {
  for (var i = 0; i < board.length; i++) {
    if (hasAnyEmptyCells(board[i])) continue;
    board.splice(i, 1);
    board.unshift(createLine());
  }
};

var isAllEmpty = function (arr) {
  return !arr.some(function (val) {
    return val;
  });
};
var createLine = function () {
  var arr = [];
  for (var i = 0; i < WIDTH; i++) {
    arr[i] = 0;
  }
  return arr;
};
var hasAnyEmptyCells = function (arr) {
  return arr.some(function (val) {
    return !val;
  });
};

var renderBoard = function () {
  clear();
  for (var i = 0; i < HEIGHT; i++) {
    const line = board[i]
      .map((square) =>
        square ? chalk.blue(SQUARE_CHAR) : chalk.white(SQUARE_CHAR)
      )
      .join("");
    log(line);
  }
  return true;
};

var gameLoop = function () {
  if (moveCurrentFigure(0, 1)) return setTimeout(gameLoop, SPEED);
  clearCompletedLines();
  if (y < 0) {
    renderBoard();
    process.exit(0);
  }
  generateNewFigure();
  setTimeout(gameLoop, SPEED);
};

var moveCurrentFigure = function (dx, dy) {
  removeCurrentFigureMutation();
  x += dx;
  y += dy;
  if (addFigureMutation()) return renderBoard();
  x -= dx;
  y -= dy;
  addFigureMutation();
  renderBoard();
};

var rotateCurrentFigure = function (dir) {
  removeCurrentFigureMutation();
  rotateCurrentFigureMutation(dir);
  if (addFigureMutation()) return renderBoard();
  rotateCurrentFigureMutation(-dir);
  addFigureMutation();
};

var rotateCurrentFigureMutation = function (dir) {
  var result = [];
  for (var i = 0; i < figure.length; i++) {
    for (var j = 0; j < figure[i].length; j++) {
      var y = dir === 1 ? j : figure.length - j - 1;
      var x = dir === 1 ? figure.length - 1 - i : i;
      result[y] = result[y] || [];
      result[y][x] = figure[i][j];
    }
  }
  figure = result;
};

var addFigureMutation = function (renderBoard) {
  for (var i = 0; i < figure.length; i++) {
    for (var j = 0; j < figure[i].length; j++) {
      var py = y + i;
      var px = x + j;
      if (figure[i][j] && (px < 0 || px >= WIDTH)) return false;
      if (py < 0) continue;
      if (!figure[i][j]) continue;
      if (!board[py] || board[py][px] || board[py][px] === undefined)
        return false;
      if (!renderBoard) continue;
      board[py][px] = figure[i][j] || board[py][px];
    }
  }
  return renderBoard ? true : addFigureMutation(true);
};

var removeCurrentFigureMutation = function () {
  for (var i = 0; i < figure.length; i++) {
    for (var j = 0; j < figure[i].length; j++) {
      var py = y + i;
      var px = x + j;
      if (px < 0) continue;
      if (!figure[i][j] || !board[py] || board[py][px] === undefined) continue;
      board[py][px] = 0;
    }
  }
};

setTimeout(gameLoop, SPEED);

generateNewFigure();
addFigureMutation();
renderBoard();

// setTimeout(() => {
//   process.exit(0);
// }, 5000);

// Important - this emits keypress
readline.emitKeypressEvents(process.stdin);
// provide basic user interaction
process.stdin.on("keypress", (str, key) => {
  if (key.name === "c" || key.name === "escape") {
    process.exit(0);
  }
  if (key.name === "right") {
    moveCurrentFigure(1, 0);
  }
  if (key.name === "left") {
    moveCurrentFigure(-1, 0);
  }
  if (key.name === "down") {
    if (moveCurrentFigure(0, 1)) {
      score++;
    }
  }
  if (key.name === "up") {
    rotateCurrentFigure(1);
  }
  if (key.name === "space") {
    while (moveCurrentFigure(0, 1)) {
      score++;
    }
  }
});

try {
  process.stdin.setRawMode(true);
} catch (err) {
  require("tty").setRawMode(true);
}
