import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';

import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

import styles from './styles.css';

interface TetrisSignature {
  Element: HTMLDivElement;
  Args: {};
}

export default class Tetris extends Component<TetrisSignature> {
  // Services
  @service declare peer: PeerService;

  // Defaults
  @tracked score = 0;
  @tracked lines = 0;
  @tracked level = 0;
  @tracked data?: string;

  // Getter and setter
  get connection() {
    return [...this.peer.connections][0];
  }

  // Functions
  listenToData = () => {
    this.connection.on('data', (data) => {
      this.data = data as string;
    });

    this.connection.on('error', () => {
      this.peer.connections.delete(this.connection);
    });
  };

  play = () => {
    console.log('play');
  };

  // Template
  <template>
    {{#if this.connection}}
      <div class={{bem styles}} ...attributes {{didInsert this.listenToData}}>
        <canvas width='320' height='640' class={{bem styles 'game'}}></canvas>
        <div class={{bem styles 'sidebar'}}>
          <div>
            <h1>TETRIS</h1>
            <p>Score: {{this.score}}</p>
            <p>Lines: {{this.lines}}</p>
            <p>Level: {{this.level}}</p>
            <p>Action: {{this.data}}</p>
            <canvas class={{bem styles 'preview'}}></canvas>
          </div>
          <button {{on 'click' this.play}} type='button'>Play</button>
        </div>
      </div>
    {{else}}
      <h1>Waiting for Connection</h1>
    {{/if}}
  </template>
}
