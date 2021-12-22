import Route from '@ember/routing/route';
import { inject as service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';

export default class ApplicationRoute extends Route {
  // Services
  @service peer!: PeerService;


  // Hooks
  beforeModel() {
    return this.peer.id;
  }
}
