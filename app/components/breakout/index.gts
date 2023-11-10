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

import { onLeft, onRight, onStart, onStop, loop, setupGame } from './game';
import styles from './styles.css';

interface BreakoutSignature {
  Element: HTMLDivElement;
  Args: {};
}

const scoreMap: {} = {
  red: 4,
  orange: 3,
  green: 2,
  yellow: 1,
};

export class Breakout extends Component<BreakoutSignature> {
  // Services
  @service declare game: GameService;
  @service declare peer: PeerService;

  // Defaults
  animationFrame: number = 0;
  canvas?: HTMLCanvasElement | null;
  context?: CanvasRenderingContext2D | null;
  @tracked score = 0;

  constructor(owner: unknown, args: BreakoutSignature['Args']) {
    super(owner, args);

    this.game.activateGame('breakout', () => {
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
      console.log(data);

      const event = data as GameEvent;
      const commands = [
        'remote:left',
        'remote:right',
        'remote:down',
        'remote:stop',
      ];
      if (event.game !== 'breakout' || !commands.includes(event.name)) {
        return;
      }

      if (event.name === 'remote:left') {
        onLeft();
      }

      if (event.name === 'remote:right') {
        onRight();
      }

      if (event.name === 'remote:down') {
        onStart();
      }

      if (event.name === 'remote:stop') {
        onStop();
      }
    });

    this.connection?.on('error', () => {
      if (this.connection) {
        this.peer.connections.delete(this.connection);
      }
    });
  };

  play = () => {
    this.score = 0;
    this.animationFrame = requestAnimationFrame(loop);
  };

  gameOver = () => {
    cancelAnimationFrame(this.animationFrame);
    this.game.gameOver(this.score, this.level);
  };

  onScore = (brick: {}) => {
    this.score += scoreMap[brick.color];
  };

  setupBoard = modifier((element: HTMLCanvasElement) => {
    this.canvas = element;
    this.context = this.canvas.getContext('2d');
    setupGame(this.canvas, this.context, this.onScore);
  });

  // Template
  <template>
    {{#if this.game.isWaitingForPlayer}}
      <h2>Breakout</h2>
      <h1>Waiting for player...</h1>
    {{else}}
      {{#if this.game.showLeaderboard}}
        <h2>Breakout</h2>
        <h1>Leaderboard</h1>
        <Leaderboard
          @items={{this.game.highscores}}
          @playerScore={{this.game.playerScore}}
        />
      {{else}}
        <div class={{bem styles}} {{didInsert this.listenToData}} ...attributes>
          <div class={{bem styles 'board-wrapper'}}>
            <canvas
              width='400'
              height='500'
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
      {{/if}}
    {{/if}}
  </template>
}

export default Breakout;
