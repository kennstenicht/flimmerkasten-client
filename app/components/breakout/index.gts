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

// @ts-ignore
import Game from './game';
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
  canvas?: HTMLCanvasElement | null;
  context?: CanvasRenderingContext2D | null;
  @tracked lives = 3;
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
    this.connection?.on('data', this.onRemoteData);

    this.connection?.on('error', () => {
      if (this.connection) {
        this.peer.connections.delete(this.connection);
      }
    });
  };

  onRemoteData = (data: unknown) => {
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
      Game.controls.onLeft();
    }

    if (event.name === 'remote:right') {
      Game.controls.onRight();
    }

    if (event.name === 'remote:down') {
      Game.controls.onStart();
    }

    if (event.name === 'remote:stop') {
      Game.controls.onStop();
    }
  };

  play = () => {
    this.lives = 3;
    this.score = 0;
    Game.loop();
  };

  gameOver = () => {
    this.connection?.off('data', this.onRemoteData);
    Game.stop();
    this.game.gameOver(this.score, this.level);
  };

  onLost = () => {
    this.lives -= 1;
    if (this.lives <= 0) {
      this.gameOver();
    }
  };

  onScore = (brick: {}) => {
    // @ts-ignore
    this.score += scoreMap[brick.color];
  };

  setupBoard = modifier((element: HTMLCanvasElement) => {
    this.canvas = element;
    this.context = this.canvas.getContext('2d');
    Game.setup(
      this.canvas,
      this.context,
      this.gameOver,
      this.onLost,
      this.onScore,
    );
  });

  // Template
  <template>
    {{#if this.game.isWaitingForPlayer}}
      <h1>Waiting for player...</h1>
    {{else}}
      {{#if this.game.showLeaderboard}}
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
            <div class={{bem styles 'box'}}>
              <div class={{bem styles 'label'}}>Lives</div>
              <div class={{bem styles 'value'}}>{{this.lives}}</div>
            </div>
            <canvas class={{bem styles 'preview'}}></canvas>
            <div class={{bem styles 'made-by'}}>
              made with love by ag—prop and friends
            </div>
          </div>
        </div>
      {{/if}}
    {{/if}}
  </template>
}

export default Breakout;
