import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';

import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

import styles from './styles.css';

interface IframeSignature {
  Element: HTMLIFrameElement;
}

export class Iframe extends Component<IframeSignature> {
  // Services
  @service declare peer: PeerService;

  // Defaults
  @tracked iframeSrc: string = 'https://ag-prop.com';

  // Getter and setter
  get connection() {
    return [...this.peer.connections][0];
  }

  // Functions
  listenToData = () => {
    this.connection?.on('data', (data) => {
      const actions = (data as string).split(';');

      actions.forEach((action) => {
        const [actionName, actionValue] = action.split('=');

        switch (actionName) {
          case 'iframeSrc':
            if (actionValue) {
              this.iframeSrc = actionValue;
            }
            break;
        }
      });
    });

    this.connection?.on('error', () => {
      if (this.connection) {
        this.peer.connections.delete(this.connection);
      }
    });
  };

  // Template
  <template>
    {{#if this.connection}}
      <div {{didInsert this.listenToData}}></div>
    {{/if}}
    <iframe
      class={{bem styles}}
      src={{this.iframeSrc}}
      title='Website'
      ...attributes
    ></iframe>
  </template>
}

export default Iframe;
