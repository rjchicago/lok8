const k8s = require('@kubernetes/client-node');

class KubernetesClient {
  constructor() {
    this.config = new k8s.KubeConfig();
    process.env.KUBECONFIG 
      ? this.config.loadFromFile(process.env.KUBECONFIG) 
      : this.config.loadFromCluster();
    this.watchApi = new k8s.Watch(this.config);
    this.coreApi = this.config.makeApiClient(k8s.CoreV1Api);
  }

  watch = async (path, handler, onError) => {
    await this.watchApi.watch(
      path,
      {},
      handler,
      onError,
    );
  }

  patchNamespacedPod = async (podName, namespace, payload) => {
    // https://github.com/kubernetes-client/javascript/blob/master/examples/patch-example.js
    // https://github.com/Agirish/kubernetes-client-java/blob/master/kubernetes/docs/CoreV1Api.md#patchNamespacedPod
    const options = { headers: { 'Content-type': 'application/merge-patch+json' } };
    await this.coreApi.patchNamespacedPod(
      podName,
      namespace,
      payload,
      undefined,
      undefined,
      undefined,
      undefined,
      undefined,
      options
    );
  }

  getNodeLabels = async (nodeName, regexMatch) => {
    const node = await this.coreApi.readNode(nodeName);
    return Object.entries(node.body.metadata.labels || {})
      .filter(([key]) => key.match(regexMatch))
      .reduce((obj, [key, value]) => {
        obj[key] = value;
        return obj;
      }, {});
  }
}

module.exports = KubernetesClient;
