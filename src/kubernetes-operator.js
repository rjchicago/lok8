const KubernetesClient = new require('./kubernetes-client');

const GLOBAL_MODE = process.env.GLOBAL_MODE === "true" ? true : false;
const podAnnotation = 'lok8.io/enabled';

class KubernetesOperator {
  constructor() {
    this.kc = new KubernetesClient();
  }

  watchPods = async () => {
    await this.kc.watch.watch(
      '/api/v1/pods',
      {},
      this.handlePodChange,
      (err) => console.error(err),
    );
  }

  handlePodChange = async (type, pod) => {
    if (!pod.spec.nodeName || !['ADDED', 'MODIFIED'].includes(type)) return;
    if (GLOBAL_MODE || (pod.metadata.annotations && pod.metadata.annotations[podAnnotation] === 'true')) {
      const labels = await this.getNodeTopologyLabels(pod.spec.nodeName);
      labels.forEach(async ({labelKey, labelValue}) => {
        if (pod.metadata.labels && pod.metadata.labels[labelKey] === labelValue) {
          console.debug(`SKIPPING: ${pod.metadata.name} » pod already has label ${labelKey}=${labelValue}`);
          return;
        }
        await this.applyLabelToPod(pod.metadata.name, pod.metadata.namespace, labelKey, labelValue);
      });
    }
  }

  applyLabelToPod = async (podName, namespace, labelKey, labelValue) => {
    const payload = { metadata: { labels: { [labelKey]: labelValue } } }
    const options = { headers: { 'Content-type': 'application/merge-patch+json' } };
    console.info(`PATCH: ${podName} » label ${labelKey}=${labelValue}`);
    try {
      // https://github.com/kubernetes-client/javascript/blob/master/examples/patch-example.js
      // https://github.com/Agirish/kubernetes-client-java/blob/master/kubernetes/docs/CoreV1Api.md#patchNamespacedPod
      await this.kc.coreApi.patchNamespacedPod(
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
    catch (err) {
      console.error('Error applying label to pod:', err);
    }
  }

  getNodeTopologyLabels = async (nodeName) => {
    try {
      const node = await this.kc.coreApi.readNode(nodeName);
      return Object.keys(node.body.metadata.labels)
        .filter(key => key.startsWith('topology.kubernetes.io'))
        .map(key => {
          return {
            labelKey: key,
            labelValue: node.body.metadata.labels[key] 
          };
        });
    }
    catch (err) {
      console.error('Error getting node labels:', err);
      return [];
    }
  }
}  

module.exports = KubernetesOperator;
