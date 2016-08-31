# Bower plugin

Executes bower commands

## Bower install

### Arguments
```
{
  "bower": {
    "install": true,
    "save": ["save" / "saveDev"],
    "forceLatest": true,
    "offline": true
  }
}
```

#### Required arguments:
```install``` Is __REQUIRED__ to activate the plugin.

#### Optional arguments:
```save``` Accepts values __```save```__ for ```--save``` or __```saveDev```__ for ```--save-dev```

```forceLatest``` Set to __```true```__ for ```--save```

```offline```Set to __```true```__ for ```--force-latest```

## Bower list

### Arguments
```
{
  "bower": {
    "list": true,
    "offline": true,
    "json": true
  }
}
```

#### Required arguments:
```list``` Is __REQUIRED__ to activate the plugin.

#### Optional arguments:
```offline```Set to __```true```__ for ```--force-latest```
```json```Set to __```true```__ for ```--json```

### Output:
The result of the execution is stored in ```this.params.bower.result```


### Examples
```
{
  "bower": {
    "install": true,
    "forceLatest": true
  }
}
```
This will make a ```bower install --force-latest```

```
{
  "bower": {
    "list": true,
    "offline": true,
    "json": true
  }
}
```
This will make a ```bower list --json --offline```
