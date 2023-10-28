import Component from '@glimmer/component';
import { service } from '@ember/service';
import { modifier } from 'ember-modifier';
import QRCode from 'qrcode';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';
import styles from './styles.css';

interface SetupCodeSignature {
  Element: HTMLCanvasElement;
}

const createQrCode = modifier((element, [data]: [string]) => {
  if (data) {
    QRCode.toCanvas(element, data, {
      margin: 1,
      width: window.innerHeight,
      color: {
        dark: '#ffffffff',
        light: '#16171bff',
      },
    });
  }
});

export default class SetupCode extends Component<SetupCodeSignature> {
  // Services
  @service declare peer: PeerService;

  // Template
  <template>
    <div class={{bem styles}}>
      {{#if this.peer.id}}
        <canvas {{createQrCode this.peer.id}} ...attributes>
        </canvas>
      {{else}}
        <h1>{{this.peer.state}}</h1>
      {{/if}}
    </div>
  </template>
}
