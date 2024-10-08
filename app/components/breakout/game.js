let animationFrame;
let bricks;
const callbacks = {};
let canvas;
let context;
let paddle;

function setup(can, ctx, onGameOver, onLost, onScore) {
  canvas = can;
  context = ctx;
  callbacks.onGameOver = onGameOver;
  callbacks.onLost = onLost;
  callbacks.onScore = onScore;

  buildBricks();

  paddle = {
    // place the paddle horizontally in the middle of the screen
    x: canvas.width / 2 - brickWidth / 2,
    y: 440,
    width: brickWidth,
    height: brickHeight,

    // paddle x velocity
    dx: 0,
  };
}

// each row is 14 bricks long. the level consists of 6 blank rows then 8 rows
// of 4 colors: red, orange, green, and yellow
const level1 = [
  [],
  [],
  [],
  [],
  [],
  [],
  ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
  ['R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R', 'R'],
  ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  ['O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O', 'O'],
  ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
  ['G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G', 'G'],
  ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
  ['Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y', 'Y'],
];

// create a mapping between color short code (R, O, G, Y) and color name
const colorMap = {
  R: '#8b956d',
  O: '#6b7353',
  G: '#414141',
  Y: '#22251b',
};

// use a 2px gap between each brick
const brickGap = 2;
const brickWidth = 25;
const brickHeight = 12;

// the wall width takes up the remaining space of the canvas width. with 14 bricks
// and 13 2px gaps between them, thats: 400 - (14 * 25 + 2 * 13) = 24px. so each
// wall will be 12px
const wallSize = 12;

function buildBricks() {
  bricks = [];

  // create the level by looping over each row and column in the level1 array
  // and creating an object with the bricks position (x, y) and color
  for (let row = 0; row < level1.length; row++) {
    for (let col = 0; col < level1[row].length; col++) {
      const colorCode = level1[row][col];

      bricks.push({
        x: wallSize + (brickWidth + brickGap) * col,
        y: wallSize + (brickHeight + brickGap) * row,
        color: colorMap[colorCode],
        width: brickWidth,
        height: brickHeight,
      });
    }
  }
}

const ball = {
  x: 130,
  y: 260,
  width: 10,
  height: 10,

  // how fast the ball should go in either the x or y direction
  speed: 2,

  // ball velocity
  dx: 0,
  dy: 0,
};

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return (
    obj1.x < obj2.x + obj2.width &&
    obj1.x + obj1.width > obj2.x &&
    obj1.y < obj2.y + obj2.height &&
    obj1.y + obj1.height > obj2.y
  );
}

// game loop
export function loop() {
  animationFrame = requestAnimationFrame(loop);

  if (!canvas || !context) {
    return;
  }

  context.clearRect(0, 0, canvas.width, canvas.height);

  // move paddle by it's velocity
  paddle.x += paddle.dx;

  // prevent paddle from going through walls
  if (paddle.x < wallSize) {
    paddle.x = wallSize;
  } else if (paddle.x + brickWidth > canvas.width - wallSize) {
    paddle.x = canvas.width - wallSize - brickWidth;
  }

  // move ball by it's velocity
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  // left & right walls
  if (ball.x < wallSize) {
    ball.x = wallSize;
    ball.dx *= -1;
  } else if (ball.x + ball.width > canvas.width - wallSize) {
    ball.x = canvas.width - wallSize - ball.width;
    ball.dx *= -1;
  }
  // top wall
  if (ball.y < wallSize) {
    ball.y = wallSize;
    ball.dy *= -1;
  }

  // reset ball if it goes below the screen
  if (ball.y > canvas.height) {
    ball.x = 130;
    ball.y = 260;
    ball.dx = 0;
    ball.dy = 0;
    callbacks.onLost();
  }

  // check to see if ball collides with paddle. if they do change y velocity
  if (collides(ball, paddle)) {
    ball.dy *= -1;

    // move ball above the paddle otherwise the collision will happen again
    // in the next frame
    ball.y = paddle.y - ball.height;
  }

  // check to see if ball collides with a brick. if it does, remove the brick
  // and change the ball velocity based on the side the brick was hit on
  for (let i = 0; i < bricks.length; i++) {
    const brick = bricks[i];

    if (collides(ball, brick)) {
      // remove brick from the bricks array
      bricks.splice(i, 1);
      callbacks.onScore(brick);

      if (bricks.length <= 0) {
        callbacks.onGameOver();
      }

      // ball is above or below the brick, change y velocity
      // account for the balls speed since it will be inside the brick when it
      // collides
      if (
        ball.y + ball.height - ball.speed <= brick.y ||
        ball.y >= brick.y + brick.height - ball.speed
      ) {
        ball.dy *= -1;
      }
      // ball is on either side of the brick, change x velocity
      else {
        ball.dx *= -1;
      }

      break;
    }
  }

  // draw walls
  context.fillStyle = '#22251b';
  context.fillRect(0, 0, canvas.width, wallSize);
  context.fillRect(0, 0, wallSize, canvas.height);
  context.fillRect(canvas.width - wallSize, 0, wallSize, canvas.height);

  // draw ball if it's moving
  if (ball.dx || ball.dy) {
    context.fillStyle = '#414141';
    context.fillRect(ball.x, ball.y, ball.width, ball.height);
  }

  // draw bricks
  bricks.forEach(function (brick) {
    context.fillStyle = brick.color;
    context.fillRect(brick.x, brick.y, brick.width, brick.height);
  });

  // draw paddle
  context.fillStyle = '#35392a';
  context.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

const controls = {
  onLeft() {
    paddle.dx = -3;
  },
  onRight() {
    paddle.dx = 3;
  },
  onStart() {
    // if they ball is not moving, we can launch the ball using the space key. ball
    // will move towards the bottom right to start
    if (ball.dx === 0 && ball.dy === 0) {
      ball.dx = ball.speed;
      ball.dy = ball.speed;
    }
  },
  onStop() {
    paddle.dx = 0;
  },
};

function stop() {
  cancelAnimationFrame(animationFrame);
}

export default {
  animationFrame,
  controls,
  loop,
  setup,
  stop,
};
