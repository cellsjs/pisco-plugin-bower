'use strict';

const fs = require('fs');
const path = require('path');

module.exports = {

  check() {
    this.params.bower = this.params.bower ? this.params.bower : {};
    this.params.stages = this.params.stages ? this.params.stages : [];
    if (this._bowerStage('check') || this.params.stages.length === 0) {
      return this._bowerAction();
    }
  },
  config() {
    if (this._bowerStage('config')) {
      return this._bowerAction();
    }
  },
  run() {
    if (this._bowerStage('run')) {
      return this._bowerAction();
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
        .then((result) => this._bowerPost(result));
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
    _bowerStage(stage) {
      return (this.params.bower.installed || this.params.bower.updated) && this.params.stages.indexOf(stage) >= 0;
    },
    _bowerAction() {
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
    },
    _bowerInstall() {
      this._bowerPre();
      const args = this._bowerForceLatest([ 'install' ]);
      return this.execute('bower', args)
        .then(() => this._bowerPost());
    },
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
    _bowerPre() {
      this.params.bower.baseDirPath = this.params.bower.baseDir
        ? path.resolve(this.params.bower.baseDir)
        : null;
      if (this._bowerIsBaseDir()) {
        this.params.bower.currentDirPath = path.resolve(process.cwd());
        process.chdir(this.params.bower.baseDirPath);
      }
    },
    _bowerPost(result) {
      if (this.params.bower.currentDirPath) {
        process.chdir(this.params.bower.currentDirPath);
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
    _bowerUpdate() {
      this._bowerPre();
      const args = this._bowerForceLatest([ 'update' ]);
      return this.execute('bower', args)
        .then(() => this.execute('bower', [ 'prune' ]))
        .then(() => this._bowerPost());
    },
    _bowerIsBaseDir() {
      return this.params.bower.baseDirPath && this.fsExists(this.params.bower.baseDirPath);
    }
  }
};
