import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import Peer, { DataConnection } from 'peerjs';

const { ipcRenderer } = require('electron');

interface Display {
  id: string;
}

export default class PeerService extends Service {
  // Services
  @service router!: RouterService;


  // Defaults
  dataConnection!: DataConnection;
  display?: Display;
  peer?: Peer;
  @tracked id!: string;


  // Constructor
  constructor() {
    super(...arguments);

    ipcRenderer.on('display-data', this.setDisplayData);

    taskFor(this.createPeerConnection).perform();

    registerDestructor(this, () => {
      this.peer?.destroy();
    });
  }


  // Actions
  @action
  onConnectionClose() {
    taskFor(this.createDataConnection).perform();
  }

  @action
  onConnectionOpen() {
    console.log('onConnectionOpen');
  }

  @action
  onPeerError(error: any) {
    switch (error.type) {
      case 'peer-unavailable':
        taskFor(this.createDataConnection).perform();
        break;

      case 'server-error':
        taskFor(this.retryPeerConnection).perform();
        break;

      default:
        console.log(error.type, error);
        break;
    }
  }

  @action
  onPeerOpen(id: string) {
    this.id = id;

    taskFor(this.createDataConnection).perform();
  }

  @action
  setDisplayData(_event: Event, display: Display) {
    this.display = display;
  }


  // Tasks
  @restartableTask
  *createDataConnection() {
    this.dataConnection = yield this.peer?.connect('master-peer', {
      metadata: {
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        display: this.display
      }
    });

    // this.dataConnection.on('error', this.onError);
    this.dataConnection.on('close', this.onConnectionClose);
    this.dataConnection.on('open', this.onConnectionOpen);
  }

  @restartableTask
  *createPeerConnection() {
    this.peer = new Peer(undefined, {
      host: 'flimmerkasten.herokuapp.com',
      secure: true
    });

    this.peer.on('error', this.onPeerError);
    this.peer.on('open', this.onPeerOpen);
  }

  @restartableTask
  *retryPeerConnection() {
    yield timeout(10000);

    taskFor(this.createPeerConnection).perform();
  }
}
