'use strict';

module.exports = {

  check() {
    this.params.bower = this.params.bower ? this.params.bower : {};
    if (this.params.dependenciesInstalled) {
      return this.bowerInstall();
    }
  },
  addons: {
    bowerList(params) {
      this._bowerPre();
      let args = [ 'list' ];
      if (params) {
        args = args.concat(args, params);
      }
      return this.execute('bower', args)
        .then(() => this._bowerPost());
    },
    bowerIsBaseDir() {
      return this.params.bower.baseDir && this.fsExists(this.params.bower.baseDir);
    },
    _bowerPre() {
      if (this.bowerIsBaseDir()) {
        process.cwd(this.params.bower.baseDir);
      }
    },
    _bowerPost() {
      if (this.bowerIsBaseDir()) {
        process.cwd(this.params.workingDir);
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
