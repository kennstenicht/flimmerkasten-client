import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | app-data', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let service = this.owner.lookup('service:app-data');
    assert.ok(service);
  });
});
