'use strict';

module.exports = {
  run: function(ok, ko) {
    let result;
    const _executeBower = (command, _ok, _ko) => {
      // bower install by default
      this.logger.info('#white', `bower ${command}`);
      let args = [ command ];

      // Save dependencies option
      if (this.params.bower.save === 'save') {
        args.push('--save');
      } else if (this.params.bower.save === 'saveDev') {
        args.push('--save-dev');
      }

      // Force Latest option
      if (this.params.bower.forceLatest) {
        args.push('--force-latest');
      }

      // Offline option
      if (this.params.bower.offline) {
        args.push('--offline');
      }

      // json option
      if (this.params.bower.json) {
        args.push('--json');
      }

      this.logger.info('#blue', 'bower args', args);
      return this.executeSync('bower', args, _ko, false);
    };

    if (this.params.bower.install) {
      result = _executeBower('install', ko, ok);
    } else if (this.params.bower.list) {
      result = _executeBower('list', ko, ok);
    }

    this.params.bower.result = result.stdout.toString();
  }
};
