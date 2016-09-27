'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {

  check() {
    this.params.bower = this.params.bower ? this.params.bower : {};
    if (this.params.bower.installed || this.params.bower.updated) {
      return this.bowerInstall();
    }
  },
  addons: {
    _bowerAreSymbolicLinks() {
      this._bowerPre();
      if (!this.bowerIsInstalled()) {
        return Promise.resolve(false);
      }
      return new Promise((ok, ko) => {
        const where = this.bowerDirectory();
        fs.readdir(where, (err, files) => {
          if (err) {
            return ko(err);
          }

          const promises = files.map((file) => new Promise((res, rej) => {
            fs.lstat(path.resolve(where, file), (_err, stats) => {
              if (_err) {
                return rej();
              }
              const isSymbolicLink = stats.isSymbolicLink();
              if (isSymbolicLink) {
                this.logger.info('#yellow', `Symbolic link found: ${file}`);
              }
              return res(isSymbolicLink);
            });
          }));

          return Promise.all(promises)
            .then((result) => result.reduce((a, b) => a || b))
            .then((result) => ok(result));
        });
      });
    },
    _bowerPre() {
      if (this.bowerIsBaseDir()) {
        process.cwd(this.params.bower.baseDir);
      }
    },
    _bowerPost(result) {
      if (this.bowerIsBaseDir()) {
        process.cwd(this.params.workingDir);
      }
      return result;
    },
    _bowerPromptLinks() {
      this.params.promptLinks = [ {
        type: 'confirm',
        name: 'doBowerUpdate',
        required: true,
        message: `There are symbolic links in your ${this.bowerDirectory()} folder. Do you want to update bower dependencies anyway?`
      } ];
    },
    _bowerCheckIfUpdate(check) {
      if (check) {
        this._bowerPromptLinks();
        return this.inquire('promptLinks')
          .then(() => {
            if (this.params.doBowerUpdate) {
              return this._bowerUpdate();
            }
          });
      }
      return this._bowerUpdate();
    },
    _bowerForceLatest(args) {
      if (this.params.bower.forceLatest !== false) {
        args.push('-F');
      }
      return args;
    },
    _bowerInstall() {
      this._bowerPre();
      const args = this._bowerForceLatest([ 'install' ]);
      return this.execute('bower', args)
        .then(() => this._bowerPost());
    },
    _bowerUpdate() {
      this._bowerPre();
      const args = this._bowerForceLatest([ 'update' ]);
      return this.execute('bower', args)
        .then(() => this.execute('bower', [ 'prune' ]))
        .then(() => this._bowerPost());
    },
    bowerList(params) {
      this._bowerPre();
      let args = [ 'list' ];
      if (params) {
        args = args.concat(args, params);
      }
      return this.execute('bower', args)
        .then((result) => this._bowerPost(result));
    },
    bowerIsBaseDir() {
      return this.params.bower.baseDir && this.fsExists(this.params.bower.baseDir);
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
      if (!this.bowerIsInstalled()) {
        this.logger.info('Bower', '#green', 'installing', '...');
        return this._bowerInstall();
      } else if (this.params.bower.updated) {
        this.logger.info('Bower', '#green', 'updating', '...');
        return this._bowerAreSymbolicLinks()
          .then((result) => this._bowerCheckIfUpdate(result));
      } else {
        this.logger.info('Bower installed:', '#green', 'OK');
      }
    }
  }

};
