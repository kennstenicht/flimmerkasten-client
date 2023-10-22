import { LinkTo } from '@ember/routing';
import Component from '@glimmer/component';
import { bem } from 'flimmerkasten-client/helpers/bem';
import styles from './styles.css';

interface DevToolbarSignature {
  Element: HTMLCanvasElement;
}

export default class DevToolbar extends Component<DevToolbarSignature> {
  // Template
  <template>
    <nav class={{bem styles}} aria-label='Developer Navigation'>
      <ul class={{bem styles 'list'}}>
        <li><LinkTo @route='status'>Status</LinkTo></li>
        <li><LinkTo @route='setup'>Setup</LinkTo></li>
      </ul>
    </nav>
  </template>
}
