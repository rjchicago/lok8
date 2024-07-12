const KubernetesOperator = require('./kubernetes-operator');
const operator = new KubernetesOperator();
operator.watchPods();
