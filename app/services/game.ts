import RouterService from '@ember/routing/router-service';
import Service, { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { DataConnection } from 'peerjs';

import { GameEvent } from 'flimmerkasten-client/models/game';
import Leaderboard, { Score } from 'flimmerkasten-client/models/leaderboard';
import AppDataService from 'flimmerkasten-client/services/app-data';

export class GameService extends Service {
  @service declare appData: AppDataService;
  @service declare router: RouterService;

  // Config
  private _debug: boolean = true;
  private gameOverTimeout: number = 3000;
  private idleTimeout = 60000;
  private idleTimer?: ReturnType<typeof setTimeout>;
  private waitingForPlayerTimeout: number = 6000;

  // Defaults
  @tracked activeGame?: string;
  @tracked highscores: Score[] = [];
  @tracked isGameOver = false;
  @tracked isWaitingForPlayer = true;
  @tracked leaderboard: Leaderboard = new Leaderboard();
  @tracked play = () => {};
  @tracked playerConnection?: DataConnection;
  @tracked playerScore?: Score;
  @tracked showLeaderboard: boolean = false;

  activateGame(game: string, play: () => void) {
    this.debug('activateGame', game);

    this.activeGame = game;
    this.play = play;

    this.reloadLeaderboard(game);
    this.waitForPlayer();
  }

  startGame(playerConnection: DataConnection) {
    this.debug('startGame', this.activeGame);

    this.resetGame();

    // Setup new player connection
    this.isWaitingForPlayer = false;
    this.playerConnection = playerConnection;
    this.playerConnection.send({ game: this.activeGame, name: 'host:playing' });

    this.play();
  }

  waitForPlayer() {
    this.debug('waitForPlayer', this.activeGame);

    this.resetGame();

    this.isWaitingForPlayer = true;

    this.idleTimer = setTimeout(() => {
      this.debug('idleTimeout', 'transitionTo peer.iframe');
      this.activeGame = undefined;
      this.router.transitionTo('peer.iframe');
    }, this.idleTimeout);
  }

  resetGame() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
    }

    this.isGameOver = false;
    this.showLeaderboard = false;
    this.playerConnection = undefined;
    this.playerScore = undefined;
  }

  handleSetupGame(connection: DataConnection, data: any) {
    this.debug('handleSetupGame', data);

    const event = data as GameEvent;
    if (event.name !== 'remote:setup-game') {
      return;
    }

    this.debug(this.activeGame);
    if (!this.activeGame || this.activeGame !== event.game) {
      this.debug('transitionTo', event.game);

      this.router.transitionTo(`peer.${event.game}`);
    }
  }

  handlePlayIntend(connection: DataConnection, data: any) {
    this.debug('handlePlayIntend', data);

    if (!this.activeGame) {
      return;
    }

    const event = data as GameEvent;
    if (event.name !== 'remote:play') {
      return;
    }

    if (!this.isWaitingForPlayer) {
      this.debug('unable-to-join');

      const { playerName } = this.playerConnection!.metadata;
      connection.send({
        game: this.activeGame,
        name: 'host:unable-to-join',
        message: playerName,
      });
      return;
    }

    this.startGame(connection);
  }

  async gameOver(score: number, level: number) {
    if (!this.activeGame || !this.playerConnection) {
      return;
    }
    this.debug('gameOver', this.activeGame);

    this.isGameOver = true;

    const { playerName } = this.playerConnection.metadata;
    this.playerScore = await this.saveScore(this.activeGame, {
      name: playerName,
      score,
      level,
      timestamp: Date.now(),
    });
    this.highscores = this.leaderboard.top(10);

    this.debug('gameOver', this.playerScore);

    // TODO: Send score
    this.playerConnection.send({
      game: this.activeGame,
      name: 'host:game-over',
    });

    setTimeout(() => {
      this.showLeaderboard = true;
      setTimeout(() => {
        this.waitForPlayer();
      }, this.waitingForPlayerTimeout);
    }, this.gameOverTimeout);
  }

  private async reloadLeaderboard(game: string) {
    const file = `leaderboards/${game}.json`;

    // Load and initialize leaderboard
    const content = await this.appData.load(file);
    if (content) {
      this.leaderboard.fromJSON(content);
      this.highscores = this.leaderboard.top(10);
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
