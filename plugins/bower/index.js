'use strict';

const fs = require('fs');
const path = require('path');
const glob = require('glob');
const shrinkwrapFile = 'bower_shrinkwrap.json';

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
    bowerConsolidate(config) {
      return this._bowerAction()
        .then(() => this._bowerCompare(config));
    },
    _bowerCompare(config) {
      const file = shrinkwrapFile;
      this._bowerPre();
      return this.bowerShrinkwrap()
        .then(() => this._bowerPost())
        .then(() => {
          const oldf = this.fsReadFile(`_${file}`);
          const newf = this.fsReadFile(file);
          fs.renameSync(file, `_${file}`);
          config.hasChanged = oldf.toString() !== newf.toString() ? `_${file}` : false;
          this.logger.info('Dependencies has changed', config.hasChanged ? '#green' : '#yellow', config.hasChanged !== false);
          return config;
        });
    },
    _bowerReadDep(file, dependencies) {
      const json = this.fsReadConfig(file);
      if (json._originalSource || json.version || json._resolution && json._resolution.commit) {
        json.version = json.version ? json.version : json._resolution.commit;
        dependencies[json.name] = json._originalSource === json.name ? json.version : `${json._originalSource}#${json.version}`;
      } else {
        return Promise.reject({error: `Dependency "${json.name}" has no version or commit: Is not possible to be Shrink-wrapped`});
      }
    },
    bowerShrinkwrap() {
      const promises = [];
      const dependencies = {};
      return new Promise((ok, ko) => {
        glob(`${this.bowerDirectory()}/**/.bower.json`, {}, (er, files) => {
          files.forEach((file) => {
            promises.push(this._bowerReadDep(file, dependencies));
          });
          Promise.all(promises).then(ok).catch(ko);
        });
      })
      .then(() => {
        const bower = this.fsReadConfig('bower.json');
        bower.dependencies = dependencies;
        fs.writeFileSync(shrinkwrapFile, JSON.stringify(bower, null, 2));
      });
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
    bowerDirectory() {
      if (this.fsExists('.bowerrc') && !this.params._bowerrc) {
        this.params._bowerrc = this.fsReadConfig('.bowerrc');
        this.params.bower.directory = bowerrc.directory;
      }
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
        return Promise.resolve();
      }
    },
    _bowerInstall() {
      this._bowerPre();
      const args = this._bowerForceLatest(this._bowerProduction([ 'install' ]));
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
    _bowerProduction(args) {
      if (this.params.bower.production !== false) {
        args.push('-p');
      }
      return args;
    },
    _bowerPre() {
      if (this._bowerIsBaseDir()) {
        this.params._origAbsDir = process.cwd();
        process.chdir(this.params.bower.baseDir);
      }
      if (this.params.bower.lockedInstall) {
        if (this.fsExists(`_${shrinkwrapFile}`)) {
          fs.renameSync('bower.json', '_bower.json');
          fs.renameSync(`_${shrinkwrapFile}`, 'bower.json');
        } else {
          this.logger.warn('Is not possible to make a locked installation.', '#green', `_${shrinkwrapFile}`, 'do not exists');
        }
      }
    },
    _bowerPost(result) {
      if (this._bowerIsBaseDir()) {
        process.chdir(this.params._origAbsDir);
      }
      if (this.params.bower.lockedInstall && this.fsExists('_bower.json')) {
        fs.renameSync('bower.json', `_${shrinkwrapFile}`);
        fs.renameSync('_bower.json', 'bower.json');
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
      return (this.params.bower.baseDir && this.fsExists(this.params.bower.baseDir)) || this.params._origAbsDir;
    }
  }
};
