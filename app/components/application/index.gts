import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import ENV from 'flimmerkasten-client/config/environment';
import Button from 'flimmerkasten-client/components/ui/button';
import bem from 'flimmerkasten-client/helpers/bem';
import Navigation from './navigation';
import SetupCode from './setup-code';
import StatusMonitor from './status-monitor';
import styles from './styles.css';

interface ApplicationSignature {
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
}

export default class Application extends Component<ApplicationSignature> {
  // Defaults
  @tracked isStatusMonitorOpen = false;
  @tracked isSetupCodeOpen = false;

  // Getter and setter
  get isDevelopment() {
    return ENV.environment === 'development';
  }

  // Function
  toggleIsStatusMonitorOpen = () => {
    this.isStatusMonitorOpen = !this.isStatusMonitorOpen;
  };

  toggleIsSetupCodeOpen = () => {
    this.isSetupCodeOpen = !this.isSetupCodeOpen;
  };

  // Template
  <template>
    <div class={{bem styles}} ...attributes>
      {{#if this.isDevelopment}}
        <div class={{bem styles 'toolbar'}}>
          <div class={{bem styles 'content'}}>
            <Navigation />
            <div class={{bem styles 'spacer'}}></div>
            <Button
              @variant={{if this.isStatusMonitorOpen 'active' 'primary'}}
              {{on 'click' this.toggleIsStatusMonitorOpen}}
            >
              Status Monitor
            </Button>
            <Button
              @variant={{if this.isSetupCodeOpen 'active' 'primary'}}
              {{on 'click' this.toggleIsSetupCodeOpen}}
            >
              Setup Code
            </Button>
          </div>
        </div>
      {{/if}}
      {{#if this.isStatusMonitorOpen}}
        <StatusMonitor />
      {{/if}}
      {{#if this.isSetupCodeOpen}}
        <SetupCode />
      {{/if}}
      {{yield}}
    </div>
  </template>
}
