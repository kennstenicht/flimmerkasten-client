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
        {{this.peer.monitor.name}}
      </h1>

      <div class={{bem styles 'status'}}>
        {{this.peer.state}}
      </div>

      <div class={{bem styles 'message'}}>
        {{this.peer.message}}
      </div>

      <div class={{bem styles 'meta'}}>
        <div class={{bem styles 'label'}}>
          Peer ID:
        </div>
        <div class={{bem styles 'value'}}>
          {{this.peer.id}}
        </div>
        <div class={{bem styles 'label'}}>
          Screen Width
        </div>
        <div class={{bem styles 'value'}}>
          {{this.peer.monitor.size.width}}
        </div>
        <div class={{bem styles 'label'}}>
          Screen Height
        </div>
        <div class={{bem styles 'value'}}>
          {{this.peer.monitor.size.height}}
        </div>
      </div>
    </div>
  </template>
}
