export const colors: { [key: string | number]: string } = {
  0: 'transparent',
  I: '#8b956d',
  O: '#777f5d',
  T: '#6b7353',
  S: '#515641',
  Z: '#414141',
  J: '#35392a',
  L: '#22251b',
};

export const tetrominos = {
  I: [
    [0, 0, 0, 0],
    [1, 1, 1, 1],
    [0, 0, 0, 0],
    [0, 0, 0, 0],
  ],
  J: [
    [1, 0, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
  L: [
    [0, 0, 1],
    [1, 1, 1],
    [0, 0, 0],
  ],
  O: [
    [1, 1],
    [1, 1],
  ],
  S: [
    [0, 1, 1],
    [1, 1, 0],
    [0, 0, 0],
  ],
  Z: [
    [1, 1, 0],
    [0, 1, 1],
    [0, 0, 0],
  ],
  T: [
    [0, 1, 0],
    [1, 1, 1],
    [0, 0, 0],
  ],
};

export const grid = 32;

export const scoreMap: { [key: number]: number } = {
  0: 0,
  1: 100,
  2: 400,
  3: 900,
  4: 2000,
};

export const speedMap: { [key: number]: number } = {
  0: 35,
  1: 30,
  2: 25,
  3: 20,
  4: 15,
  5: 10,
  6: 5,
  7: 2,
  8: 1,
};
