import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

interface Args {}

export default class IframeComponent extends Component<Args> {
  // Services
  @service peer!: PeerService;


  // Defaults
  blockName = 'c-iframe';


  // Template
  <template>
    {{#if this.peer.settings.iframeSrc}}
      <iframe
        class={{bem this.blockName}}
        src={{this.peer.settings.iframeSrc}}
        title="Website"
      ></iframe>
    {{/if}}
  </template>
  }
