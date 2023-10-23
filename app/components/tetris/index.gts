import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import { on } from '@ember/modifier';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';
import styles from './styles.css';

interface SetupSignature {
  Element: HTMLDivElement;
}

export default class Tetris extends Component<SetupSignature> {
  // Services
  @service declare peer: PeerService;

  // Defaults
  @tracked score = 0;
  @tracked lines = 0;
  @tracked level = 0;

  // Functions
  play = () => {
    console.log('play');
  };

  // Template
  <template>
    <div class={{bem styles}} ...attributes>
      <canvas width='320' height='640' class={{bem styles 'game'}}></canvas>
      <div class={{bem styles 'sidebar'}}>
        <div>
          <h1>TETRIS</h1>
          <p>Score: {{this.score}}</p>
          <p>Lines: {{this.lines}}</p>
          <p>Level: {{this.level}}</p>
          <canvas class={{bem styles 'preview'}}></canvas>
        </div>
        <button {{on 'click' this.play}}>Play</button>
      </div>
    </div>
  </template>
}
