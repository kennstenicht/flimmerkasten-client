import Component from '@glimmer/component';
import { service } from '@ember/service';

import { bem } from 'flimmerkasten-client/helpers/bem';
import PeerService from 'flimmerkasten-client/services/peer';

import styles from './styles.css';

interface StatusMonitorSignature {
  Element: HTMLDivElement;
}

export default class StatusMonitor extends Component<StatusMonitorSignature> {
  // Services
  @service declare peer: PeerService;

  // Template
  <template>
    <div class={{bem styles}} ...attributes>
      <h1 class={{bem styles 'monitor-name'}}>
        {{this.peer.object.id}}
      </h1>

      <div class={{bem styles 'status'}}>
        {{if this.peer.isOpen 'Open' 'Connecting...'}}
      </div>

      <div class={{bem styles 'message'}}>
        {{this.peer.errorMessage}}
      </div>

      <div class={{bem styles 'meta'}}>
        <div class={{bem styles 'label'}}>
          Peer Id:
        </div>
        <div class={{bem styles 'value'}}>
          {{this.peer.object.id}}
        </div>
        <div class={{bem styles 'label'}}>
          Monitor:
        </div>
        <div class={{bem styles 'value'}}>
          {{this.peer.monitor.name}}
        </div>
        <div class={{bem styles 'label'}}>
          Screen Width
        </div>
        <div class={{bem styles 'value'}}>
          {{window.innerWidth}}
        </div>
        <div class={{bem styles 'label'}}>
          Screen Height
        </div>
        <div class={{bem styles 'value'}}>
          {{window.innerHeight}}
        </div>
      </div>
    </div>
  </template>
}
