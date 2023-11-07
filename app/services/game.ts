import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { DataConnection } from 'peerjs';

export class GameService extends Service {
  @tracked currentGame?: string;
  @tracked isGameOver = false;
  @tracked play = () => {};
  @tracked playerConnection?: DataConnection;

  setupGame(name: string, play: () => void) {
    this.debug('setup', name);

    this.currentGame = name;
    this.play = play;
  }

  handlePlayIntend(connection: DataConnection, data: any) {
    if (!this.currentGame || data !== this.event('play')) {
      return;
    }

    if (this.playerConnection) {
      // TODO: Handle unable to join situation (someone is playing)
      // connection.send(this.event('unable-to-join'));
      return;
    }

    // Setup new player connection
    this.playerConnection = connection;
    this.playerConnection.send(this.event('playing'));

    // Start the game
    this.isGameOver = false;
    this.play();
  }

  gameOver(score: number) {
    this.isGameOver = true;

    // TODO: Write highscore, somewhere
    console.log(
      'gameOver',
      'score',
      this.playerConnection?.metadata?.name,
      score,
    );

    this.playerConnection?.send(this.event('game-over'));
    this.playerConnection = undefined;
  }

  event(event: string) {
    return `${this.currentGame}:${event}`;
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
