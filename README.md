(manual copy of info.md of the plugin)
Bower commands wrapper for pisco

### Hook (stages: check, config, run)

Any step can ensure that **bower install** or **bower update** are correctly executed:

#### 1. Install plugin in your recipe 
 
 **Add package dependency**:
 
    npm install pisco-plugin-bower --save
 
 **Add plugin on steps/$stepName/config.json plugins**:
 
```
{
  "plugins": [
    [...]
    "bower" 
  ]
}
```

#### 2. Add bower requirement to Step

```
{
  "requirements": {
    [...]
    "bower": {}
  }
}
```


#### 3. Configure plugin in config.json of your step


```
{
  "bower": {
    "installed": true,
    "updated": true,
    "forceLatest": false, (default is true)
    "baseDir" : "any", (default is '.') 
    "directory" : "bower_components" (default is 'bower_components')
  }
}
```

  - **installed** _(default: false)_ Ensure that bower install is executed if ${bower.directory} doesn't exists execute bower install.
  - **updated** _(default: false)_ Ensure that `bower update` and `bower prune` are executed. Detect if there are symbolics links and ask user to delete 
  - **forceLatest** _(default: true)_ append --force-latest (-F) to bower install or bower update command.
  - **directory** _(default: 'bower_components')_ must to be the same value of `directory` in .bowerrc file.
  - **baseDir** _(default: '.')_ path to bower.json file relative.
  
#### 4. Configure the stages for the hook (could be check, config or run)

**By default the hook is set on check stage**

In config.json of your step
 
```
{
  "stages" : ["check", "config", "run"],
  "bower": {
    [...]
  }
}
```

  
#### Examples:
 
Normal use, ensure bower install was executed:

```
{
  "bower": {
    "installed": true
  }
}
```

Check if there are symbolics links and ask user to update:

```
{
  "bower": {
    "updated": true
  }
}
```

### this.bowerList

Execute **bower list ${opts}**

| Param | Description |
| --- | --- |
| opts | array with command options to append to bower list for example [ '--offline', '--json' ]  |
| returns | a Promise with the complete child_process object result of the execution |

