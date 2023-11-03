import Service from '@ember/service';
import { registerDestructor } from '@ember/destroyable';
import { TrackedSet } from 'tracked-built-ins';
import { currentMonitor, Monitor, appWindow } from '@tauri-apps/api/window';

import Peer, { DataConnection } from 'peerjs';
import { tracked } from '@glimmer/tracking';
import { restartableTask, timeout } from 'ember-concurrency';
import {
  readTextFile,
  writeTextFile,
  createDir,
  BaseDirectory,
} from '@tauri-apps/api/fs';
import { v4 as uuidv4 } from 'uuid';

export class PeerService extends Service {
  // Defaults
  @tracked errorMessage?: string;
  @tracked hostConnection?: DataConnection;
  @tracked monitor?: Monitor | null;
  @tracked object: Peer = new Peer({ debug: 0 });
  @tracked isOpen: boolean = false;
  connections: TrackedSet<DataConnection> = new TrackedSet([]);

  // Create peer on initialization and register destructor
  constructor() {
    super();

    currentMonitor()
      .then((monitor) => {
        this.monitor = monitor;
      })
      .catch((error) => console.log(error));

    this.createPeer.perform();

    registerDestructor(this, () => {
      this.object?.destroy();
    });
  }

  createPeer = restartableTask(async (delay?: number) => {
    if (delay) await timeout(delay);

    const appConfig = await this.getAppConfig();

    const peer = new Peer(appConfig.peerId, {
      debug: 0,
    });

    peer.on('open', () => {
      this.isOpen = true;
    });

    peer.on('disconnected', () => {
      this.isOpen = false;
    });

    peer.on('error', (error) => {
      this.errorMessage = error.message;
    });

    peer.on('connection', (connection) => {
      connection.on('open', () => {
        this.connections.add(connection);
      });

      connection.on('close', () => {
        this.connections.delete(connection);
      });
    });

    this.object = peer;
  });

  getAppConfig = async () => {
    let appConfig;

    try {
      const appConfigString = await readTextFile(`${appWindow.label}.conf`, {
        dir: BaseDirectory.AppConfig,
      });
      appConfig = JSON.parse(appConfigString);
    } catch (error) {
      await createDir('windows', {
        dir: BaseDirectory.AppConfig,
        recursive: true,
      });
      appConfig = { peerId: uuidv4() };
      await writeTextFile(
        `${appWindow.label}.conf`,
        JSON.stringify(appConfig),
        {
          dir: BaseDirectory.AppConfig,
        },
      );
    }

    return appConfig;
  };
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
