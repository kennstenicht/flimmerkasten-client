import Component from '@glimmer/component';
import { bem } from 'flimmerkasten-client/helpers/bem';
import DevToolbar from './dev-toolbar';
import styles from './styles.css';

interface ApplicationSignature {
  Element: HTMLDivElement;
}

export default class Application extends Component<ApplicationSignature> {
  // Template
  <template>
    <div class={{bem styles}} ...attributes>
      <DevToolbar />
      {{yield}}
    </div>
  </template>
}
