const k8s = require('@kubernetes/client-node');

class KubernetesClient {
  constructor() {
    this.kc = new k8s.KubeConfig();
    this.loadConfig();
    this.watch    = new k8s.Watch(this.kc);
    this.coreApi  = this.kc.makeApiClient(k8s.CoreV1Api);
  }

  loadConfig = () => {
    if (process.env.KUBECONFIG) {
      this.kc.loadFromFile(process.env.KUBECONFIG);
    } else {
      this.kc.loadFromCluster();
    }
  }
}

module.exports = KubernetesClient;
