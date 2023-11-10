import Route from '@ember/routing/route';
import { service } from '@ember/service';
import PeerService from 'flimmerkasten-client/services/peer';

export default class PeerRoute extends Route {
  // Services
  @service declare peer: PeerService;

  // Hooks
  model({ peer_id }: Record<string, string>) {
    if (!peer_id) {
      return;
    }
    this.peer.createPeer.perform(peer_id);

    return peer_id;
  }
}
