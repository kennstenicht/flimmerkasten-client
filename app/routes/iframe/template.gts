import RouteTemplate from 'ember-route-template';
import pageTitle from 'ember-page-title/helpers/page-title';
import Iframe from 'flimmerkasten-client/components/iframe';

export default RouteTemplate(<template>
  {{pageTitle 'Setup'}}

  <Iframe />
</template>);
