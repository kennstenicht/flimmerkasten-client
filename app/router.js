import EmberRouter from '@ember/routing/router';
import config from 'flimmerkasten-client/config/environment';

export default class Router extends EmberRouter {
  location = config.locationType;
  rootURL = config.rootURL;
}

Router.map(function () {
  this.route('peer', { path: ':peer_id' }, function () {
    this.route('iframe', { path: '/' });
    this.route('stream');
    this.route('tetris');
    this.route('snake');
    this.route('breakout');
  });
});
