# LoK8

`LoK8` will copy node topology labels to pods running on each node.

## Modes

### Global Mode

**Global Mode** is disabled by default. Run `LoK8` in **Global Mode** by setting environment variable `GLOBAL_MODE=true`.

#### Global Mode Example

``` yaml
  env:
    - name: GLOBAL_MODE
      value: "true"

```

### Pod Mode

Enable `LoK8` at the **Pod** level by applying the `LoK8` annotation on each Pod individually or by using the Pod Template.

#### Pod Mode Example

``` yaml
  template:
    metadata:
      annotations:
        lok8.io/enabled: 'true'
```

### Related

Related Kubernetes features:

* [Topology Aware Routing](https://kubernetes.io/docs/concepts/services-networking/topology-aware-routing/)
* [Traffic Distribution](https://kubernetes.io/docs/concepts/services-networking/service/#traffic-distribution)
