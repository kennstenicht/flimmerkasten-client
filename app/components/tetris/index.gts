import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';
import { modifier } from 'ember-modifier';

import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

import { colors, grid, tetrominos, scoreMap, speedMap } from './constances';
import {
  createBlankPlayfield,
  generateSequence,
  rotate,
  isValidMove,
  placeTetromino,
  getNextTetromino,
  type Tetromino,
} from './utils';
import styles from './styles.css';

interface TetrisSignature {
  Element: HTMLDivElement;
  Args: {};
}

export default class Tetris extends Component<TetrisSignature> {
  // Services
  @service declare peer: PeerService;

  // Defaults
  animationFrame: number = 0;
  canvas?: HTMLCanvasElement | null;
  context?: CanvasRenderingContext2D | null;
  frameCount = 0;
  @tracked isGameOver = false;
  @tracked lines = 0;
  playfield = createBlankPlayfield();
  @tracked score = 0;
  @tracked tetrominoSequence: (keyof typeof tetrominos)[] = generateSequence();
  tetromino: Tetromino = getNextTetromino(
    this.playfield,
    this.tetrominoSequence,
  );

  // Getter and setter
  get connection() {
    return [...this.peer.connections][0];
  }

  get level() {
    return Math.round(this.lines / 2);
  }

  get speed() {
    return speedMap[this.level];
  }

  // Functions
  listenToData = () => {
    this.connection.on('data', (data: string) => {
      switch (data) {
        case 'tetris:play':
          this.play();
          break;

        case 'tetris:left':
        case 'tetris:right':
        case 'tetris:up':
        case 'tetris:down':
          const tetrominoCopy = { ...this.tetromino };

          if (data === 'tetris:left') {
            tetrominoCopy.col--;
          }

          if (data === 'tetris:right') {
            tetrominoCopy.col++;
          }

          if (data === 'tetris:up') {
            tetrominoCopy.matrix = rotate(tetrominoCopy.matrix);
          }

          if (data === 'tetris:down') {
            tetrominoCopy.row++;

            if (!isValidMove(this.playfield, tetrominoCopy)) {
              tetrominoCopy.row--;

              const successful = placeTetromino(this.playfield, tetrominoCopy);

              if (successful) {
                this.lines += successful.clearedLines;
                this.score += scoreMap[successful.clearedLines];
                if (this.tetrominoSequence.length === 0) {
                  this.tetrominoSequence = generateSequence();
                }
                this.tetromino = getNextTetromino(
                  this.playfield,
                  this.tetrominoSequence,
                );
              } else {
                this.gameOver();
              }

              return;
            }
          }

          if (isValidMove(this.playfield, tetrominoCopy)) {
            this.tetromino = tetrominoCopy;
          }
          break;
      }
    });

    this.connection.on('error', () => {
      this.peer.connections.delete(this.connection);
    });
  };

  loop = () => {
    this.animationFrame = requestAnimationFrame(this.loop);

    if (!this.canvas || !this.context) {
      return;
    }

    this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // draw the playfield
    for (let row = 0; row < 20; row++) {
      for (let col = 0; col < 10; col++) {
        if (this.playfield[row][col]) {
          const name = this.playfield[row][col];
          this.context.fillStyle = colors[name];

          // drawing 1 px smaller than the grid creates a grid effect
          this.context.fillRect(col * grid, row * grid, grid - 2, grid - 2);
        }
      }
    }

    // draw the active tetromino
    if (this.tetromino) {
      // tetromino falls every 35 frames
      if (++this.frameCount > this.speed) {
        this.frameCount = 0;
        this.tetromino.row++;

        // place piece if it runs into anything
        if (!isValidMove(this.playfield, this.tetromino)) {
          this.tetromino.row--;
          const successful = placeTetromino(this.playfield, this.tetromino);

          if (successful) {
            this.lines += successful.clearedLines;
            this.score += scoreMap[successful.clearedLines];
            if (this.tetrominoSequence.length === 0) {
              this.tetrominoSequence = generateSequence();
            }
            this.tetromino = getNextTetromino(
              this.playfield,
              this.tetrominoSequence,
            );
          } else {
            this.gameOver();
          }
        }
      }

      this.context.fillStyle = colors[this.tetromino.name];

      for (let row = 0; row < this.tetromino.matrix.length; row++) {
        for (let col = 0; col < this.tetromino.matrix[row].length; col++) {
          if (this.tetromino.matrix[row][col]) {
            // drawing 1 px smaller than the grid creates a grid effect
            this.context.fillRect(
              (this.tetromino.col + col) * grid,
              (this.tetromino.row + row) * grid,
              grid - 2,
              grid - 2,
            );
          }
        }
      }
    }
  };

  play = () => {
    this.playfield = createBlankPlayfield();
    this.tetrominoSequence = generateSequence();
    this.tetromino = getNextTetromino(this.playfield, this.tetrominoSequence);
    this.isGameOver = false;
    this.lines = 0;
    this.score = 0;
    this.connection.send('tetris:play');
    this.animationFrame = requestAnimationFrame(this.loop);
  };

  gameOver = () => {
    cancelAnimationFrame(this.animationFrame);
    this.isGameOver = true;
    this.connection.send('tetris:game-over');
  };

  setupBoard = modifier((element: HTMLCanvasElement) => {
    this.canvas = element;
    this.context = this.canvas.getContext('2d');
  });

  // Template
  <template>
    {{#if this.connection}}
      <div class={{bem styles}} {{didInsert this.listenToData}} ...attributes>
        <div class={{bem styles 'frame'}}></div>
        <div class={{bem styles 'board-wrapper'}}>
          <canvas
            width='320'
            height='640'
            class={{bem styles 'board'}}
            {{this.setupBoard}}
          ></canvas>
          {{#if this.isGameOver}}
            <div class={{bem styles 'game-over'}}>
              Game Over
            </div>
          {{/if}}
        </div>
        <div class={{bem styles 'frame'}}></div>

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
          <div class={{bem styles 'box'}}>
            <div class={{bem styles 'label'}}>Lines</div>
            <div class={{bem styles 'value'}}>{{this.lines}}</div>
          </div>
          <canvas class={{bem styles 'preview'}}></canvas>
        </div>
      </div>
    {{else}}
      <h1>Waiting for player...</h1>
    {{/if}}
  </template>
}
