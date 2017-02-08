## Main Index:

- [Available Commands](#available-commands)
  - [Flows](#flows)
  - [Steps](#steps)
- [Plugins](#plugins)
  - [bower](#bower-execute-a-bower-install)
  - [bowerRegistry](#bowerregistry-check-bower-registry-configuration)


## Available Commands:

### FLOWS

### STEPS

## PLUGINS

#### bower (Execute a bower install)
[[Index]](#main-index)

Bower commands wrapper for pisco

### Hook (stages: check, config, run)

Any step can ensure that **bower install** or **bower update** are correctly executed:

#### 1. Install plugin in your recipe 
 
 **Add package dependency**:
 
    npm install pisco-plugin-bower --save
 
 **Add plugin on steps/$stepName/config.json plugins**:
 
```
{
  &quot;plugins&quot;: [
    [...]
    &quot;bower&quot; 
  ]
}
```

#### 2. Add bower requirement to Step

```
{
  &quot;requirements&quot;: {
    [...]
    &quot;bower&quot;: {}
  }
}
```


#### 3. Configure plugin in config.json of your step


```
{
  &quot;bower&quot;: {
    &quot;installed&quot;: true,
    &quot;updated&quot;: true,
    &quot;forceLatest&quot;: false, (default is true)
    &quot;baseDir&quot; : &quot;any&quot;, (default is &#39;.&#39;) 
    &quot;directory&quot; : &quot;bower_components&quot; (default is &#39;bower_components&#39;)
  }
}
```

  - **installed** _(default: false)_ Ensure that bower install is executed if ${bower.directory} doesn&#39;t exists execute bower install.
  - **updated** _(default: false)_ Ensure that `bower update` and `bower prune` are executed. Detect if there are symbolics links and ask user to delete 
  - **forceLatest** _(default: true)_ append --force-latest (-F) to bower install or bower update command.
  - **directory** _(default: &#39;bower_components&#39;)_ must to be the same value of `directory` in .bowerrc file.
  - **baseDir** _(default: &#39;.&#39;)_ path to bower.json file relative.
  
#### 4. Configure the stages for the hook (could be check, config or run)

**By default the hook is set on check stage**

In config.json of your step
 
```
{
  &quot;stages&quot; : [&quot;check&quot;, &quot;config&quot;, &quot;run&quot;],
  &quot;bower&quot;: {
    [...]
  }
}
```

  
#### Examples:
 
Normal use, ensure bower install was executed:

```
{
  &quot;bower&quot;: {
    &quot;installed&quot;: true
  }
}
```

Check if there are symbolics links and ask user to update:

```
{
  &quot;bower&quot;: {
    &quot;updated&quot;: true
  }
}
```

### this.bowerList

Execute **bower list ${opts}**

| Param | Description |
| --- | --- |
| opts | array with command options to append to bower list for example [ &#39;--offline&#39;, &#39;--json&#39; ]  |
| returns | a Promise with the complete child_process object result of the execution |



#### bowerRegistry (Check bower registry configuration)
[[Index]](#main-index)

### Description

Plugin used to register bower repositories using a public bower registry

How to use this plugin:

- 1. Implicit: Calling public addons.
- 2. Explicit: By configuration. Checks if bower Registry is well configured.

configure this.params.stages with an array of the stages you want to check if the npm registry is ok.

```
  &quot;stages&quot; : [&quot;check&quot;, &quot;run&quot;]
```

Check and configure ~/.bowerrc file that is right configured using artifactory.

### Addons

#### this.registerBower

Return: 0 if everything is Ok or status of the command executed.

