import Component from '@glimmer/component';
import { service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

interface IframeSignature {
  Element: HTMLIframeElement
}

export default class Iframe extends Component<IframeSignature> {
  // Services
  @service declare peer: PeerService;


  // Defaults
  blockName = 'c-iframe';


  // Template
  <template>
    {{#if this.peer.settings.iframeSrc}}
      <iframe
        class={{bem this.blockName}}
        src={{this.peer.settings.iframeSrc}}
        title="Website"
        ...attributes
      ></iframe>
    {{/if}}
  </template>
}
