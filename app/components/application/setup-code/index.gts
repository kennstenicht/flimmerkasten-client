import type { TOC } from '@ember/component/template-only';

import { modifier } from 'ember-modifier';
import QRCode from 'qrcode';

import bem from 'flimmerkasten-client/helpers/bem';

import styles from './styles.css';

interface SetupCodeSignature {
  Element: HTMLCanvasElement;
  Args: {
    peerId: string;
  };
}

const createQrCode = modifier((element, [data]: [string]) => {
  QRCode.toCanvas(element, data, {
    margin: 1,
    width: window.innerHeight,
    color: {
      dark: '#ffffffff',
      light: '#16171bff',
    },
  });
});

export const SetupCode: TOC<SetupCodeSignature> = <template>
  <div class={{bem styles}}>
    <canvas {{createQrCode @peerId}} ...attributes>
    </canvas>
  </div>
</template>;

export default SetupCode;
