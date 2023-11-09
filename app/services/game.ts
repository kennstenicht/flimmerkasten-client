import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { DataConnection } from 'peerjs';

import { GameEvent } from 'flimmerkasten-client/models/game';
import Leaderboard, { Score } from 'flimmerkasten-client/models/leaderboard';
import AppDataService from 'flimmerkasten-client/services/app-data';

export class GameService extends Service {
  @service declare appData: AppDataService;

  // Config
  private _debug: boolean = false;
  private gameOverTimeout: number = 5000;

  // Defaults
  @tracked activeGame?: string;
  @tracked isGameOver = false;
  @tracked leaderboard: Leaderboard = new Leaderboard();
  @tracked play = () => {};
  @tracked playerConnection?: DataConnection;
  @tracked playerScore?: Score;
  @tracked showLeaderboard: boolean = false;

  activateGame(game: string, play: () => void) {
    this.debug('activateGame', game);

    this.activeGame = game;
    this.play = play;

    this.resetGame(game);
  }

  resetGame(game: string) {
    this.debug('resetGame', game);

    this.reloadLeaderboard(game);
    this.showLeaderboard = false;
    this.playerScore = undefined;
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
      game: this.activeGame,
      name: 'host:playing',
    });

    // Start the game
    this.isGameOver = false;
    this.play();
  }

  async gameOver(score: number, level: number) {
    if (!this.activeGame) {
      return;
    }

    this.isGameOver = true;

    const playerName = this.playerConnection?.metadata.playerName;
    const leaderboardScore = await this.saveScore(this.activeGame, {
      name: playerName,
      score,
      level,
      timestamp: Date.now(),
    });
    this.playerScore = leaderboardScore;

    this.debug('gameOver', this.activeGame, leaderboardScore);

    setTimeout(() => {
      this.showLeaderboard = true;
    }, this.gameOverTimeout);

    this.playerConnection?.send({
      game: this.activeGame,
      name: 'host:game-over',
    });
    this.playerConnection = undefined;
  }

  get topTen(): Array<Score> {
    return this.leaderboard.top(10);
  }

  private async reloadLeaderboard(game: string) {
    const file = `leaderboards/${game}.json`;

    // Load and initialize leaderboard
    const content = await this.appData.load(file);
    if (content) {
      this.leaderboard.fromJSON(content);
    }
  }

  private async saveScore(game: string, score: Score): Promise<Score> {
    const file = `leaderboards/${game}.json`;

    // Add score and save new leaderboard
    const leaderboardScore = this.leaderboard.addScore(score);
    this.appData.save(file, this.leaderboard.toJSON());

    return leaderboardScore;
  }

  private debug(...args: any[]) {
    if (this._debug) {
      console.log('Game', ...args);
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
