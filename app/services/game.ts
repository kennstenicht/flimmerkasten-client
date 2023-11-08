import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { DataConnection } from 'peerjs';

import { GameEvent } from 'flimmerkasten-client/models/game';
import Leaderboard, { Score } from 'flimmerkasten-client/models/leaderboard';
import AppDataService from 'flimmerkasten-client/services/app-data';

export class GameService extends Service {
  @service declare appData: AppDataService;

  private _debug: boolean = true;
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

  async gameOver(score: number, level: number) {
    if (!this.currentGame) {
      return;
    }

    this.isGameOver = true;

    const leaderboardScore = await this.saveScore({
      name: this.playerConnection?.metadata.playerName,
      score,
      level,
      timestamp: Date.now(),
    });

    this.debug('gameOver', this.currentGame, leaderboardScore);

    this.playerConnection?.send({
      game: this.currentGame,
      name: 'host:game-over',
    });
    this.playerConnection = undefined;
  }

  private async saveScore(score: Score): Promise<Score | undefined> {
    if (!this.currentGame) {
      return;
    }

    const file = `leaderboards/${this.currentGame}.json`;
    const leaderboard = new Leaderboard();

    // Load and initialize leaderboard
    const content = await this.appData.load(file);
    if (content) {
      leaderboard.fromJSON(content);
    }

    // Add score and save new leaderboard
    const leaderboardScore = leaderboard.addScore(score);
    this.appData.save(file, leaderboard.toJSON());

    return leaderboardScore;
  }

  private debug(...args: any[]) {
    if (this._debug) {
      console.log(...args);
    }
  }
}

export default GameService;

// DO NOT DELETE: this is how TypeScript knows how to look up your services.
declare module '@ember/service' {
  interface Registry {
    game: GameService;
  }
}
