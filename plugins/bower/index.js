'use strict';

module.exports = {

  check: function() {
    this.params.bower = this.params.bower ? this.params.bower : {};
    if (this.params.dependenciesInstalled) {
      return this.bowerInstall();
    }
  },

  /*
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
  },
*/
  addons: {
    _bowerPre() {
      const isBaseDir = this.params.bower.baseDir && this.fsExists(this.params.bower.baseDir);
      if (isBaseDir) {
        process.cwd(this.params.bower.baseDir);
      }
    },
    _bowerPost() {
      const isBaseDir = this.params.bower.baseDir && this.fsExists(this.params.bower.baseDir);
      if (isBaseDir) {
        process.cwd(this.params.bower.baseDir);
      }
    },
    bowerDirectory() {
      return this.params.bower.directory ? this.params.bower.directory : 'bower_components';
    },
    bowerIsInstalled() {
      this._bowerPre();
      const result = this.fsExists(this.bowerDirectory());
      this._bowerPost();
      return result;
    },
    bowerInstall() {
      if (!this.bowerIsInstalled() || this.params.bower.forceReinstall) {
        this._bowerPre();
        const args = [ 'install' ];
        if (this.params.bower.forceLatest !== false) {
          args.push('-F');
        }
        return this.execute('bower', args)
          .then(() => this._bowerPost());
      }
    }
  }

};
