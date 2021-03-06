import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from 'tracked-built-ins';
import { restartableTask, timeout } from 'ember-concurrency';
import { taskFor } from 'ember-concurrency-ts';
import Peer, { DataConnection } from 'peerjs';

const { ipcRenderer } = require('electron');

interface Display {
  id: string;
  bounds: {
    width: number,
    height: number
    x: number,
    y: number
  }
}

export default class PeerService extends Service {
  // Services
  @service router!: RouterService;


  // Defaults
  dataConnection?: DataConnection;
  @tracked display?: Display;
  @tracked id?: string;
  @tracked message?: string;
  @tracked state?: string;
  peer?: Peer;


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
    this.state = 'Connected';
    this.message = '';
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
    }

    this.message = error.message;
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
    if (!this.peer) {
      return;
    }

    this.dataConnection = this.peer.connect('master-peer', {
      metadata: {
        window: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        display: this.display
      }
    });

    this.dataConnection.on('close', this.onConnectionClose);
    this.dataConnection.on('open', this.onConnectionOpen);
  }

  @restartableTask
  *createPeerConnection() {
    this.state = 'Connecting...';

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
