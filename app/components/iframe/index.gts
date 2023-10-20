import Component from '@glimmer/component';
import { service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';
import styles from './styles.css';

interface IframeSignature {
  Element: HTMLIframeElement;
}

export default class Iframe extends Component<IframeSignature> {
  // Services
  @service declare peer: PeerService;

  // Template
  <template>
    {{#if this.peer.settings.iframeSrc}}
      <iframe
        class={{bem styles}}
        src={{this.peer.settings.iframeSrc}}
        title='Website'
        ...attributes
      ></iframe>
    {{/if}}
  </template>
}
