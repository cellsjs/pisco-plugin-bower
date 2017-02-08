### Description

Plugin used to register bower repositories using a public bower registry

How to use this plugin:

- 1. Implicit: Calling public addons.
- 2. Explicit: By configuration. Checks if bower Registry is well configured.

configure this.params.stages with an array of the stages you want to check if the npm registry is ok.

```
  "stages" : ["check", "run"]
```

Check and configure ~/.bowerrc file that is right configured using artifactory.

### Addons

#### this.registerBower

Return: 0 if everything is Ok or status of the command executed.