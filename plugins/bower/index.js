'use strict';

function _bowerInstall(ok, ko) {
  // bower install by default
  this.logger.info('#white', 'bower install');
  const args = [ 'install' ]
    .concat(this.params.bower.dependencies);

  // Save dependencies option
  if (this.params.bower.save === 'save') {
    args.push('--save');
  } else if (this.params.bower.save === 'saveDev') {
    args.push('--save-dev');
  }

  // Force Latest option
  if (this.params.bower.forceLatest === 'true') {
    args.push('--force-latest');
  }

  // Offline option
  if (this.params.bower.offline === 'true') {
    args.push('--offline');
  }
  this.logger.info('#blue', 'bower args', args);
  this.executeSync('bower', args, ko, true);
}

module.exports = {
  run: function(ok, ko) {
    if (this.params.bower.install) {
      _bowerInstall(ok, ko);
    }
  }
};
