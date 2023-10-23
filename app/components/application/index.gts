import Component from '@glimmer/component';
import ENV from 'flimmerkasten-client/config/environment';
import bem from 'flimmerkasten-client/helpers/bem';
import DevToolbar from './dev-toolbar';
import styles from './styles.css';

interface ApplicationSignature {
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
}

export default class Application extends Component<ApplicationSignature> {
  // Getter and setter
  get isDevelopment() {
    return ENV.environment === 'development';
  }

  // Template
  <template>
    <div class={{bem styles}} ...attributes>
      {{#if this.isDevelopment}}
        <DevToolbar />
      {{/if}}

      {{yield}}
    </div>
  </template>
}
