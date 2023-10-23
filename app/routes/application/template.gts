import RouteTemplate from 'ember-route-template';
import pageTitle from 'ember-page-title/helpers/page-title';
import Application from 'flimmerkasten-client/components/application';

export default RouteTemplate(<template>
  {{pageTitle 'Flimmerkasten'}}

  <Application>
    {{outlet}}
  </Application>
</template>);
