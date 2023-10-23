import Component from '@glimmer/component';
import { service } from '@ember/service';
import QRCode from 'qrcode';
import PeerService from 'flimmerkasten-client/services/peer';
import { modifier } from 'ember-modifier';

interface SetupSignature {
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

export default class Setup extends Component<SetupSignature> {
  // Services
  @service declare peer: PeerService;

  // Template
  <template>
    {{#if this.peer.id}}
      <canvas {{createQrCode this.peer.id}} ...attributes>
      </canvas>
    {{else}}
      <h1>{{this.peer.state}}</h1>
    {{/if}}
  </template>
}
