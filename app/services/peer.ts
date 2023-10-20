import Service from '@ember/service';
import { inject as service } from '@ember/service';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { registerDestructor } from '@ember/destroyable';
import { tracked } from 'tracked-built-ins';
import { restartableTask, timeout } from 'ember-concurrency';
import Peer, { DataConnection } from 'peerjs';

// const { ipcRenderer } = require('electron');

interface Display {
  id: string;
  bounds: {
    width: number;
    height: number;
    x: number;
    y: number;
  };
}

export default class PeerService extends Service {
  // Services
  @service declare router: RouterService;

  // Defaults
  dataConnection?: DataConnection;
  @tracked display?: Display;
  @tracked id?: string;
  @tracked message?: string;
  @tracked state?: string;
  @tracked settings: any = {
    iframeSrc: 'https://ag-prop.com',
  };
  peer?: Peer;

  // Constructor
  constructor() {
    super(...arguments);

    // ipcRenderer.on('display-data', this.setDisplayData);

    this.createPeerConnection.perform();

    registerDestructor(this, () => {
      this.peer?.destroy();
    });
  }

  // Actions
  @action
  onConnectionClose() {
    this.createDataConnection.perform();
  }

  @action
  onConnectionData(data: any) {
    let actions = data.split(';');

    actions.forEach((action: any) => {
      let [actionName, actionValue] = action.split('=');

      switch (actionName) {
        case 'transitionTo':
          this.router.transitionTo(actionValue);
          break;

        case 'settings':
          this.settings = {
            ...this.settings,
            ...JSON.parse(actionValue),
          };
          break;
      }
    });
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
      case 'socket-closed':
        this.retryPeerConnection.perform();
        break;

      case 'server-error':
        this.retryPeerConnection.perform();
        break;
    }

    this.message = `${error.type}: ${error.message}`;
  }

  @action
  onPeerOpen(id: string) {
    this.id = id;
    this.message = '';

    this.createDataConnection.perform();
  }

  @action
  setDisplayData(_event: Event, display: Display) {
    this.display = display;
  }

  // Tasks
  createDataConnection = restartableTask(async () => {
    this.state = 'Connecting...';
    if (!this.peer) {
      return;
    }

    this.dataConnection = this.peer.connect('master-peer', {
      metadata: {
        window: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
        display: this.display,
      },
    });

    this.dataConnection.on('close', this.onConnectionClose);
    this.dataConnection.on('open', this.onConnectionOpen);
    this.dataConnection.on('data', this.onConnectionData);
  });

  createPeerConnection = restartableTask(async () => {
    this.state = 'Connecting...';

    this.peer = new Peer();

    this.peer.on('error', this.onPeerError);
    this.peer.on('open', this.onPeerOpen);
  });

  retryPeerConnection = restartableTask(async () => {
    await timeout(10000);

    this.createPeerConnection.perform();
  });
}
