import type { TOC } from '@ember/component/template-only';
import { hash } from '@ember/helper';

import bem from 'flimmerkasten-client/helpers/bem';
import { Score } from 'flimmerkasten-client/models/leaderboard';

import styles from './styles.css';

interface LeaderboardSignature {
  Element: HTMLDivElement;
  Args: {
    items?: Array<Score>;
    playerScore?: Score;
  };
}
export const Leaderboard: TOC<LeaderboardSignature> = <template>
  <table class={{bem styles}}>
    <thead class={{bem styles 'header'}}>
      <tr>
        <th></th>
        <th class={{bem styles 'cell' (hash align-left=true)}}>Name</th>
        <th>Score</th>
        <th>Level</th>
      </tr>
    </thead>
    <tbody class={{bem styles 'body'}}>
      {{#each @items as |game|}}
        <tr>
          <td>{{game.rank}}.</td>
          <td>{{game.name}}</td>
          <td
            class={{bem styles 'cell' (hash align-right=true)}}
          >{{game.score}}</td>
          <td
            class={{bem styles 'cell' (hash align-right=true)}}
          >{{game.level}}</td>
        </tr>
      {{/each}}
    </tbody>

    {{#if @playerScore}}
      {{#let @playerScore as |player|}}
        <tfoot class={{bem styles 'footer'}}>
          <tr>
            <td>{{player.rank}}.</td>
            <td>{{player.name}}</td>
            <td
              class={{bem styles 'cell' (hash align-right=true)}}
            >{{player.score}}</td>
            <td
              class={{bem styles 'cell' (hash align-right=true)}}
            >{{player.level}}</td>
          </tr>
        </tfoot>
      {{/let}}
    {{/if}}
  </table>
</template>;

export default Leaderboard;
