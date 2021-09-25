import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';

interface Args {
}

export default class StatusComponent extends Component <Args> {
  // Services
  @service peer!: PeerService;
}
