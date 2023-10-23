import RouteTemplate from 'ember-route-template';
import pageTitle from 'ember-page-title/helpers/page-title';
import Tertris from 'flimmerkasten-client/components/tetris';

export default RouteTemplate(<template>
  {{pageTitle 'Tetris'}}

  <Tertris />
</template>);
