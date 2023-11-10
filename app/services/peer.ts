import Service, { service } from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { TrackedSet } from 'tracked-built-ins';
import {
  appWindow,
  availableMonitors,
  currentMonitor,
  Monitor,
  WebviewWindow,
} from '@tauri-apps/api/window';

import Peer, { DataConnection } from 'peerjs';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import { v4 as uuidv4 } from 'uuid';

import AppDataService from 'flimmerkasten-client/services/app-data';
import GameService from 'flimmerkasten-client/services/game';
import ENV from 'flimmerkasten-client/config/environment';
export class PeerService extends Service {
  // Services
  @service declare appData: AppDataService;
  @service declare game: GameService;

  // Config
  private _debug: boolean = false;

  // Defaults
  @tracked errorMessage?: string;
  @tracked hostConnection?: DataConnection;
  @tracked monitor?: Monitor | null;
  @tracked object: Peer = new Peer();
  @tracked isOpen: boolean = false;
  connections: TrackedSet<DataConnection> = new TrackedSet([]);

  // Create peer on initialization and register destructor
  constructor() {
    super(...arguments);

    if (ENV.environment === 'production') {
      availableMonitors().then((monitors) => {
        if (monitors.length > 1) {
          new WebviewWindow('flimmerkasten-2', {
            title: 'Flimmerkasten 2',
            width: 720,
            height: 576,
          });
        }

        if (appWindow.label === 'flimmerkasten-1') {
          appWindow.setPosition(monitors[0]!.position);
          appWindow.setFullscreen(true);
        }

        if (appWindow.label === 'flimmerkasten-2') {
          appWindow.setPosition(monitors[1]!.position);
          appWindow.setFullscreen(true);
        }
      });
    }

    currentMonitor().then((monitor) => {
      this.monitor = monitor;
    });

    this.createPeer.perform();

    registerDestructor(this, () => {
      this.object?.destroy();
    });
  }

  createPeer = restartableTask(async (delay?: number) => {
    if (delay) await timeout(delay);
    this.debug('createPeer');

    const appConfig = await this.getAppConfig();

    const peer = new Peer(appConfig.peerId, { debug: 0 });

    peer.on('open', () => {
      this.debug('open', peer.id);
      this.isOpen = true;
    });

    peer.on('disconnected', () => {
      this.debug('disconnected', peer.id);
      this.isOpen = false;
    });

    peer.on('error', (error) => {
      this.debug('error', peer.id, error);
      this.errorMessage = error.message;
    });

    peer.on('connection', (connection) => {
      this.debug('connection', peer.id);

      connection.on('open', () => {
        this.debug('connection', 'open', connection.peer);
        this.connections.add(connection);
      });

      connection.on('close', () => {
        this.debug('connection', 'close', connection.peer);
        this.connections.delete(connection);
      });

      connection.on('data', (data) => {
        this.game.handleSetupGame(connection, data);
        this.game.handlePlayIntend(connection, data);
      });
    });

    this.object = peer;
  });

  getAppConfig = async () => {
    const file = 'app-config.json';
    const content = await this.appData.load(file);

    let appConfig;
    if (content) {
      appConfig = JSON.parse(content);
    } else {
      appConfig = { peerId: uuidv4() };
      this.appData.save(file, JSON.stringify(appConfig));
    }

    return appConfig;
  };

  debug(...args: any[]) {
    if (this._debug) {
      console.log('Peer', ...args);
    }
  }
}

export default PeerService;

// Don't remove this declaration: this is what enables TypeScript to resolve
// this service using `Owner.lookup('service:peer')`, as well
// as to check when you pass the service name as an argument to the decorator,
// like `@service('peer') declare altName: PeerService;`.
declare module '@ember/service' {
  interface Registry {
    peer: PeerService;
  }
}
