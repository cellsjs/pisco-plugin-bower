# Bower plugin

Install bower dependencies

## Arguments
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

### Required arguments:
```install``` Is __REQUIRED__ to activate the plugin.

### Optional arguments:
```save``` Accepts values __```save```__ for ```--save``` or __```saveDev```__ for ```--save-dev```

```forceLatest``` Set to __```true```__ for ```--save```

```offline```Set to __```true```__ for ```--force-latest```

## Example
```
{
  "bower": {
    "install": true,
    "forceLatest": true
  }
}
```
This will make a ```bower install --force-latest```
