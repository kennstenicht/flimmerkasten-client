import Component from '@glimmer/component';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { modifier } from 'ember-modifier';

import Leaderboard from 'flimmerkasten-client/components/application/leaderboard';
import { GameEvent } from 'flimmerkasten-client/models/game';
import GameService from 'flimmerkasten-client/services/game';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

import { getRandomInt, speedMap } from './utils';
import styles from './styles.css';

interface SnakeSignature {
  Element: HTMLDivElement;
  Args: {};
}

interface SnakeObject {
  cells: { x: number; y: number }[];
  dx: number;
  dy: number;
  maxCells: number;
  x: number;
  y: number;
}

export class Snake extends Component<SnakeSignature> {
  // Services
  @service declare game: GameService;
  @service declare peer: PeerService;

  // Defaults
  animationFrame: number = 0;
  canvas?: HTMLCanvasElement | null;
  context?: CanvasRenderingContext2D | null;
  grid = 16;
  count = 0;

  snake: SnakeObject = {
    x: 160,
    y: 160,
    dx: this.grid,
    dy: 0,
    cells: [],
    maxCells: 4,
  };
  apple = {
    x: 320,
    y: 320,
  };
  @tracked score = 0;

  constructor(owner: unknown, args: SnakeSignature['Args']) {
    super(owner, args);

    this.game.activateGame('snake', () => {
      this.play();
    });
  }

  // Getter and setter
  get connection() {
    return this.game.playerConnection;
  }

  get level() {
    return Math.round(this.score / 2);
  }

  // Functions
  listenToData = () => {
    this.connection?.on('data', (data) => {
      const event = data as GameEvent;
      const commands = [
        'remote:left',
        'remote:right',
        'remote:up',
        'remote:down',
      ];
      if (event.game !== 'snake' || !commands.includes(event.name)) {
        return;
      }

      if (event.name === 'remote:left' && this.snake.dx === 0) {
        this.snake.dx = -this.grid;
        this.snake.dy = 0;
      }

      if (event.name === 'remote:right' && this.snake.dx === 0) {
        this.snake.dx = this.grid;
        this.snake.dy = 0;
      }

      if (event.name === 'remote:up' && this.snake.dy === 0) {
        this.snake.dy = -this.grid;
        this.snake.dx = 0;
      }

      if (event.name === 'remote:down' && this.snake.dy === 0) {
        this.snake.dy = this.grid;
        this.snake.dx = 0;
      }
    });

    this.connection?.on('error', () => {
      if (this.connection) {
        this.peer.connections.delete(this.connection);
      }
    });
  };

  loop = () => {
    this.animationFrame = requestAnimationFrame(this.loop);

    if (!this.canvas || !this.context) {
      return;
    }

    // slow game loop to 15 fps instead of 60 (60/15 = 4)
    if (++this.count < (speedMap[this.level] ?? 0)) {
      return;
    }

    this.count = 0;
    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // move snake by it's velocity
    this.snake.x += this.snake.dx;
    this.snake.y += this.snake.dy;

    // wrap snake position horizontally on edge of screen
    if (
      this.snake.x < 0 ||
      this.snake.x >= this.canvas.width ||
      this.snake.y < 0 ||
      this.snake.y >= this.canvas.height
    ) {
      this.gameOver();
    }

    // keep track of where snake has been. front of the array is always the head
    this.snake.cells.unshift({ x: this.snake.x, y: this.snake.y });

    // remove cells as we move away from them
    if (this.snake.cells.length > this.snake.maxCells) {
      this.snake.cells.pop();
    }

    // draw apple
    this.context.fillStyle = '#414141';
    this.context.fillRect(
      this.apple.x,
      this.apple.y,
      this.grid - 2,
      this.grid - 2,
    );

    // draw snake one cell at a time
    this.context.fillStyle = '#8b956d';
    for (const [index, cell] of this.snake.cells.entries()) {
      // drawing 1 px smaller than the grid creates a grid effect in the snake body so you can see how long it is
      this.context.fillRect(cell.x, cell.y, this.grid - 2, this.grid - 2);

      // snake ate apple
      if (cell.x === this.apple.x && cell.y === this.apple.y) {
        this.snake.maxCells += 4;
        this.score++;

        // canvas is 400x400 which is 25x25 grids
        this.apple.x = getRandomInt(0, 25) * this.grid;
        this.apple.y = getRandomInt(0, 25) * this.grid;
      }

      // check collision with all cells after this one (modified bubble sort)
      for (var i = index + 1; i < this.snake.cells.length; i++) {
        // snake occupies same space as a body part. reset game
        if (
          cell.x === this.snake.cells[i]?.x &&
          cell.y === this.snake.cells[i]?.y
        ) {
          this.gameOver();
        }
      }
    }
  };

  play = () => {
    this.score = 0;
    this.snake.x = 160;
    this.snake.y = 160;
    this.snake.cells = [];
    this.snake.maxCells = 4;
    this.snake.dx = this.grid;
    this.snake.dy = 0;

    this.apple.x = getRandomInt(0, 25) * this.grid;
    this.apple.y = getRandomInt(0, 25) * this.grid;
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  gameOver = () => {
    cancelAnimationFrame(this.animationFrame);
    this.game.gameOver(this.score, this.level);
  };

  setupBoard = modifier((element: HTMLCanvasElement) => {
    this.canvas = element;
    this.context = this.canvas.getContext('2d');
  });

  // Template
  <template>
    {{#if this.connection}}
      <div class={{bem styles}} {{didInsert this.listenToData}} ...attributes>
        <div class={{bem styles 'board-wrapper'}}>
          <canvas
            width='400'
            height='400'
            class={{bem styles 'board'}}
            {{this.setupBoard}}
          ></canvas>
          {{#if this.game.isGameOver}}
            <div class={{bem styles 'game-over'}}>
              Game Over
            </div>
          {{/if}}
        </div>
        <div class={{bem styles 'sidebar'}}>
          <div class={{bem styles 'score-wrapper'}}>
            <div class={{bem styles 'box'}}>
              <div class={{bem styles 'label'}}>Score</div>
            </div>
            <div class={{bem styles 'box-background'}}></div>
            <div class={{bem styles 'score'}}>{{this.score}}</div>
          </div>
          <div class={{bem styles 'box'}}>
            <div class={{bem styles 'label'}}>Level</div>
            <div class={{bem styles 'value'}}>{{this.level}}</div>
          </div>
          <canvas class={{bem styles 'preview'}}></canvas>
        </div>
      </div>
    {{else}}
      <h2>Snake</h2>
      {{#if this.game.showLeaderboard}}
        <h1>Leaderboard</h1>
        <Leaderboard
          @items={{this.game.highscores}}
          @playerScore={{this.game.playerScore}}
        />
      {{else}}
        <h1>Waiting for player...</h1>
      {{/if}}
    {{/if}}
  </template>
}

export default Snake;
