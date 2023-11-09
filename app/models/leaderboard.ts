export interface Score {
  name: string;
  score: number;
  level: number;
  timestamp: number;
  rank?: number;
}

export default class Leaderboard {
  private leaderboard: Score[];

  constructor() {
    this.leaderboard = [];
  }

  addScore(newScore: Score): Score {
    this.leaderboard.push(newScore);
    this.sortLeaderboard();

    const rank = this.leaderboard.findIndex((score) => score === newScore) + 1;

    return { ...newScore, rank };
  }

  getLeaderboard(): Score[] {
    return this.leaderboard.map((score, index) => ({
      ...score,
      rank: index + 1,
    }));
  }

  top(limit: number) {
    return this.getLeaderboard().slice(0, limit);
  }

  private sortLeaderboard() {
    this.leaderboard.sort((a, b) => {
      if (a.score !== b.score) {
        return b.score - a.score; // Sort by score in descending order
      } else {
        return a.timestamp - b.timestamp; // If scores are equal, sort by timestamp in ascending order
      }
    });
  }

  // Serialize the leaderboard data to JSON
  toJSON() {
    return JSON.stringify(this.leaderboard);
  }

  // Deserialize JSON data to populate the leaderboard
  fromJSON(json: string) {
    this.leaderboard = JSON.parse(json);
    this.sortLeaderboard(); // Make sure the deserialized leaderboard is sorted
  }
}
