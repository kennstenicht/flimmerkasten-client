import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { DataConnection } from 'peerjs';

import { GameEvent } from 'flimmerkasten-client/models/game';
export class GameService extends Service {
  @tracked currentGame?: string;
  @tracked isGameOver = false;
  @tracked play = () => {};
  @tracked playerConnection?: DataConnection;

  setupGame(name: string, play: () => void) {
    this.debug('setupGame', name);

    this.currentGame = name;
    this.play = play;
  }

  handlePlayIntend(connection: DataConnection, data: any) {
    this.debug('handlePlayIntend', data);

    const event = data as GameEvent;
    if (event.name !== 'remote:play') {
      return;
    }

    if (this.playerConnection) {
      // TODO: Handle unable to join situation (someone is playing)
      // connection.send(this.event('unable-to-join'));
      return;
    }

    // Setup new player connection
    this.playerConnection = connection;
    this.playerConnection.send({
      game: this.currentGame,
      name: 'host:playing',
    });

    // Start the game
    this.isGameOver = false;
    this.play();
  }

  gameOver(score: number) {
    if (!this.currentGame) {
      return;
    }

    this.isGameOver = true;

    // TODO: Write highscore, somewhere
    console.log(
      'gameOver',
      'score',
      this.playerConnection?.metadata?.name,
      score,
    );

    this.playerConnection?.send({
      game: this.currentGame,
      name: 'host:game-over',
    });
    this.playerConnection = undefined;
  }

  _debug: boolean = true;

  debug(...args: any[]) {
    if (this._debug) {
      console.log(...args);
    }
  }
}

export default GameService;

declare module '@ember/service' {
  interface Registry {
    game: GameService;
  }
}
