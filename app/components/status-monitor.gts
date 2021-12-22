import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';
import bem from 'flimmerkasten-client/helpers/bem';

interface Args {}

export default class StatusMonitorComponent extends Component<Args> {
  // Services
  @service peer!: PeerService;


  // Defaults
  blockName = 'c-status-monitor';


  // Template
  <template>
    <div class={{bem this.blockName}}>
      <div class={{bem this.blockName "container"}}>
        <h1 class={{bem this.blockName "display-id"}}>
          {{this.peer.display.id}}
        </h1>

        <div class={{bem this.blockName "status"}}>
          {{this.peer.state}}
        </div>

        <div class={{bem this.blockName "message"}}>
          {{this.peer.message}}
        </div>

        <div class={{bem this.blockName "meta"}}>
          <div class={{bem this.blockName "label"}}>
            Peer ID:
          </div>
          <div class={{bem this.blockName "value"}}>
            {{this.peer.id}}
          </div>
          <div class={{bem this.blockName "label"}}>
            Screen Width
          </div>
          <div class={{bem this.blockName "value"}}>
            {{this.peer.display.bounds.width}}
          </div>
          <div class={{bem this.blockName "label"}}>
            Screen Height
          </div>
          <div class={{bem this.blockName "value"}}>
            {{this.peer.display.bounds.height}}
          </div>
        </div>
      </div>
    </div>
  </template>
}
