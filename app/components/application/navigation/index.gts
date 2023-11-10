import type { TOC } from '@ember/component/template-only';
import { LinkTo } from '@ember/routing';

import { bem } from 'flimmerkasten-client/helpers/bem';

import styles from './styles.css';

interface NavigationSignature {
  Element: HTMLElement;
}

export const Navigation: TOC<NavigationSignature> = <template>
  <nav class={{bem styles}} aria-label='Developer Navigation' ...attributes>
    <ul class={{bem styles 'list'}}>
      <li><LinkTo @route='iframe'>IFrame</LinkTo></li>
      <li><LinkTo @route='tetris'>Tetris</LinkTo></li>
      <li><LinkTo @route='snake'>Snake</LinkTo></li>
    </ul>
  </nav>
</template>;

export default Navigation;
