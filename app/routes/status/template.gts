import RouteTemplate from 'ember-route-template';
import StatusMonitor from 'flimmerkasten-client/components/status-monitor';
import pageTitle from 'ember-page-title/helpers/page-title';

export default RouteTemplate(<template>
  {{pageTitle 'Status'}}

  <StatusMonitor />
</template>);
