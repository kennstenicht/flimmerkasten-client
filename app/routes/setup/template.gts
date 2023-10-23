import RouteTemplate from 'ember-route-template';
import pageTitle from 'ember-page-title/helpers/page-title';
import Setup from 'flimmerkasten-client/components/setup';

export default RouteTemplate(<template>
  {{pageTitle 'Setup'}}

  <Setup />
</template>);
