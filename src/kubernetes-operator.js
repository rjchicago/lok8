const KubernetesClient = require('./kubernetes-client');

const podAnnotationKey = 'lok8.io/enabled';
const podAnnotationValue = 'true';
const globalMode = process.env.GLOBAL_MODE === 'true' ? true : false;
const labelRegex = new RegExp(`${process.env.LABEL_REGEX || '^topology\\.kubernetes\\.io\\/.+$'}`);
console.log(`LABEL_REGEX: ${labelRegex}`);

class KubernetesOperator {
  constructor() {
    this.k8s = new KubernetesClient();
  }

  run = async () => {
    this.k8s.watch(
      '/api/v1/pods',
      this.handlePodChange,
      (err) => console.error(err)
    );
  }

  handlePodChange = async (type, pod) => {
    try {
      const { metadata: { name: podName, namespace, labels: podLabels, annotations: podAnnotation }, spec: { nodeName } } = pod;
      if (!nodeName || !['ADDED', 'MODIFIED'].includes(type)) return;
      if (!(globalMode || (podAnnotation && podAnnotation[podAnnotationKey] === podAnnotationValue))) return;
      // loop through node labels and patch pod with matching labels
      const nodeLabels = await this.k8s.getNodeLabels(nodeName, labelRegex);
      Object.entries(nodeLabels).forEach(async ([labelKey, labelValue]) => {
        // skip if pod already has label
        if (podLabels && podLabels[labelKey] === labelValue) {
          console.debug(`SKIPPING: ${podName} » pod already has label ${labelKey}=${labelValue}`);
          return;
        }
        const payload = { metadata: { labels: { [labelKey]: labelValue } } }
        console.info(`PATCH: ${podName} » ${JSON.stringify(payload)}`);
        await this.k8s.patchNamespacedPod(podName, namespace, payload);
      });
    }
    catch(err) {
      console.error('Error handling pod change:', err);
    }
  }
}  

module.exports = KubernetesOperator;
