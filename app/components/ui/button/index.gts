import Component from '@glimmer/component';
import { hash } from '@ember/helper';
import { bem } from 'flimmerkasten-client/helpers/bem';
import styles from './styles.css';

interface ButtonSignature {
  Element: HTMLButtonElement;
  Args: {
    variant: 'active' | 'primary';
  };
  Blocks: {
    default: [];
  };
}

export default class Button extends Component<ButtonSignature> {
  // Defaults
  get variant() {
    return this.args.variant ?? 'primary';
  }

  // Template
  <template>
    <button
      class={{bem styles (hash variant=this.variant)}}
      type='button'
      ...attributes
    >
      {{yield}}
    </button>
  </template>
}
