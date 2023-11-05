import { tetrominos } from './constances';

// get a random integer between the range of [min,max]
// @see https://stackoverflow.com/a/1527820/2124254
export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// generate a new tetromino sequence
// @see https://tetris.fandom.com/wiki/Random_Generator
export function generateSequence() {
  const sequence: (keyof typeof tetrominos)[] = [
    'I',
    'J',
    'L',
    'O',
    'S',
    'T',
    'Z',
  ];
  const newSequence: (keyof typeof tetrominos)[] = [];

  while (sequence.length) {
    const rand = getRandomInt(0, sequence.length - 1);
    const name = sequence.splice(rand, 1)[0]!;
    newSequence.push(name);
  }

  return newSequence;
}

// rotate an NxN matrix 90deg
// @see https://codereview.stackexchange.com/a/186834
export function rotate(matrix: number[][]) {
  const N = matrix.length - 1;
  const result = matrix.map((row, i) =>
    row.map((_val, j) => matrix[N - j]?.[i] ?? 0),
  );

  return result;
}

// check to see if the new matrix/row/col is valid
export function isValidMove(
  playfield: (number | string)[][],
  tetromino: Tetromino,
) {
  const { matrix, row: cellRow, col: cellCol } = tetromino;
  for (let row = 0; row < matrix.length; row++) {
    for (let col = 0; col < matrix[row]!.length; col++) {
      if (
        matrix[row]![col] &&
        // outside the game bounds
        (cellCol + col < 0 ||
          cellCol + col >= playfield[0]!.length ||
          cellRow + row >= playfield.length ||
          // collides with another piece
          playfield[cellRow + row]![cellCol + col])
      ) {
        return false;
      }
    }
  }

  return true;
}

export interface Tetromino {
  name: string;
  matrix: number[][];
  row: number;
  col: number;
}

// place the tetromino on the playfield
export function placeTetromino(
  playfield: (number | string)[][],
  tetromino: Tetromino,
) {
  for (let row = 0; row < tetromino.matrix.length; row++) {
    for (let col = 0; col < tetromino.matrix[row]!.length; col++) {
      if (tetromino.matrix[row]![col]) {
        // game over if piece has any part offscreen
        if (tetromino.row + row < 0) {
          return false;
        }

        playfield[tetromino.row + row]![tetromino.col + col] = tetromino.name;
      }
    }
  }

  // check for line clears starting from the bottom and working our way up
  let clearedLines = 0;
  for (let row = playfield.length - 1; row >= 0; ) {
    if (playfield[row]!.every((cell) => !!cell)) {
      clearedLines++;
      // drop every row above this one
      for (let r = row; r >= 0; r--) {
        for (let c = 0; c < playfield[r]!.length; c++) {
          playfield[r]![c] = playfield[r - 1]?.[c] ?? 0;
        }
      }
    } else {
      row--;
    }
  }

  return {
    success: true,
    clearedLines: clearedLines,
  };
}

// get the next tetromino in the sequence
export function getNextTetromino(
  playfield: (number | string)[][],
  tetrominoSequence: (keyof typeof tetrominos)[],
) {
  const name = tetrominoSequence.pop()!;
  const matrix = tetrominos[name];

  // I and O start centered, all others start in left-middle
  const col = playfield[0]!.length / 2 - Math.ceil(matrix[0]!.length / 2);

  // I starts on row 21 (-1), all others start on row 22 (-2)
  const row = name === 'I' ? -1 : -2;

  return {
    name: name, // name of the piece (L, O, etc.)
    matrix: matrix, // the current rotation matrix
    row: row, // current row (starts offscreen)
    col: col, // current col
  };
}

export function createBlankPlayfield() {
  let playfield: (number | string)[][] = [];

  for (let row = -2; row < 20; row++) {
    playfield[row] = [];

    for (let col = 0; col < 10; col++) {
      playfield[row]![col] = 0;
    }
  }

  return playfield;
}
