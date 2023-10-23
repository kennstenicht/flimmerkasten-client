import Component from '@glimmer/component';
import { service } from '@ember/service';
import QRCode from 'qrcode';
import PeerService from 'flimmerkasten-client/services/peer';
import { modifier } from 'ember-modifier';

interface SetupSignature {
  Element: HTMLCanvasElement;
}

export default class Setup extends Component<SetupSignature> {
  // Services
  @service declare peer: PeerService;

  // Functions
  createQrCode = modifier((element) => {
    if (this.peer.id) {
      QRCode.toCanvas(element, this.peer.id, {
        margin: 1,
        width: window.innerHeight,
        color: {
          dark: '#ffffffff',
          light: '#16171bff',
        },
      });
    }
  });

  // Template
  <template>
    {{#if this.peer.id}}
      <canvas {{this.createQrCode}} ...attributes>
      </canvas>
    {{else}}
      <h1>{{this.peer.state}}</h1>
    {{/if}}
  </template>
}
