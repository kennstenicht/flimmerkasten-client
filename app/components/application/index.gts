import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { on } from '@ember/modifier';
import { service } from '@ember/service';
import RouterService from '@ember/routing/router-service';
import { registerDestructor } from '@ember/destroyable';
import didInsert from '@ember/render-modifiers/modifiers/did-insert';

import { restartableTask } from 'ember-concurrency';
// @ts-ignore
import perform from 'ember-concurrency/helpers/perform';

import ENV from 'flimmerkasten-client/config/environment';
import Button from 'flimmerkasten-client/components/ui/button';
import bem from 'flimmerkasten-client/helpers/bem';
import PeerService from 'flimmerkasten-client/services/peer';

import Navigation from './navigation';
import SetupCode from './setup-code';
import StatusMonitor from './status-monitor';
import styles from './styles.css';

interface ApplicationSignature {
  Element: HTMLDivElement;
  Args: {};
  Blocks: {
    default: [];
  };
}

export default class Application extends Component<ApplicationSignature> {
  // Services
  @service declare peer: PeerService;
  @service declare router: RouterService;

  // Constructor
  constructor(owner: Application, args: ApplicationSignature['Args']) {
    super(owner, args);

    registerDestructor(this, () => {
      this.peer.hostConnection?.close();
    });
  }

  // Defaults
  @tracked isStatusMonitorOpen = false;
  @tracked isSetupCodeOpen = false;

  // Getter and setter
  get hostId() {
    return 'flimmerkasten-host';
  }

  get isDevelopment() {
    return ENV.environment === 'development';
  }

  // Function
  createHostConnection = restartableTask(async () => {
    const connection = this.peer.object.connect(this.hostId);

    connection.on('close', () => {
      this.peer.hostConnection = connection;
    });

    connection.on('open', () => {
      this.peer.hostConnection = undefined;
    });

    connection.on('error', (error) => {
      console.log(`connection ${this.hostId} error`, error.type);
    });

    connection.on('data', this.onHostConnectionData);
  });

  onHostConnectionData = (data: any) => {
    const actions = data.split(';');

    actions.forEach((action: any) => {
      const [actionName, actionValue] = action.split('=');

      switch (actionName) {
        case 'transitionTo':
          this.router.transitionTo(actionValue);
          break;
        case 'isStatusMonitorOpen':
          this.isStatusMonitorOpen = actionValue === 'true' ? true : false;
          break;
        case 'isSetupCodeOpen':
          this.isSetupCodeOpen = actionValue === 'true' ? true : false;
          break;
      }
    });
  };

  toggleIsStatusMonitorOpen = () => {
    this.isStatusMonitorOpen = !this.isStatusMonitorOpen;
  };

  toggleIsSetupCodeOpen = () => {
    this.isSetupCodeOpen = !this.isSetupCodeOpen;
  };

  // Template
  <template>
    <div class={{bem styles}} ...attributes>
      {{#if this.peer.isOpen}}
        <div {{didInsert (perform this.createHostConnection)}}>
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
            <SetupCode @peerId={{this.peer.object.id}} />
          {{/if}}
          {{! template-lint-disable no-outlet-outside-routes }}
          {{outlet}}
        </div>
      {{else}}
        <h1>Connecting...</h1>
      {{/if}}
    </div>
  </template>
}
