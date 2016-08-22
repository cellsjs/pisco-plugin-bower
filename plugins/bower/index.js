'use strict';

module.exports = {
  run: function(ok, ko) {
    const _bowerInstall = (_ok, _ko) => {
      // bower install by default
      this.logger.info('#white', 'bower install');
      let args = [ 'install' ];

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
      this.logger.info('#blue', 'bower args', args);
      this.executeSync('bower', args, _ko, true);
    };

    if (this.params.bower.install) {
      _bowerInstall(ko, ok);
    }
  }
};
