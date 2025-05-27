# Not field from USER, Di added them.
ADDED_FEATURES = {
    'dataset': ['availability_label', 'availability_llm', 'availability_license', 'done', 'skip'],
    'optimization': ['algorithm_list', 'algorithm_names', 'algorithm_category', 'meta_label', 'config_label', 'done', 'skip'], 
    'model': ['availability_label', 'license', 'done', 'skip'],
    'evaluation': ['done', 'skip']
}

# Map all known aliases to a standard form
ALGORITHM_MAP = {
    'svm': ['support vector machine', 'svm', 'svc', 'support vector regression'],
    'cnn': ['cnn', 'convolutional neural network', 'mask2former2', 'mask r-cnn', 'yolo8', 'yolov8', 'u-net', 'hrnet', 'xception', 'resnet'],
    'gnn': ['gnn', 'graph neural network', 'gcn', 'graph transformer', 'vgae'],
    'mlp': ['mlp', 'multi-layer perceptron', 'multi layer perceptron', 'feed forward neural networks', 'ffnn'],
    'dnn': ['dnn'],
    'knn': ['knn', 'k-nearest neighbor', 'k-nearest neighbors'],
    'rf': ['random forest', 'rf', 'random decision forest'],
    'xgboost': ['xgboost', 'gbdt'],
    'lightgbm': ['lightgbm'],
    'logistic regression': ['logistic regression', 'log'],
    'linear regression': ['linear regression'],
    'ridge regression': ['ridge regression', 'ridgecv'],
    'lasso': ['lasso', 'lasso regression'],
    'elastic net': ['elastic net', 'elastic net regression'],
    'naive bayes': ['naive bayes', 'nb', 'gaussian bayesian network', 'gnb'],
    'bayesian': ['bayesian', 'bayesian network'],
    'transformer': ['transformer', 'bert', 'gpt 2'],
    'autoencoder': ['autoencoder', 'deep autoencoder'],
    'stacking': ['stacking', 'ensemble learning'],
    'decision tree': ['decision tree', 'coarse decision tree', 'cart'],
    'gradient boosting': ['gradient boosting', 'boosted decision tree', 'ada boost', 'ada boosting', 'ada', 'sgb'],
    'rnn': ['rnn', 'birnn', 'cnn-lstm', 'lstm-cnn'],
    'lstm': ['lstm'],
    'ann': ['ann', 'artificial neural n'],
    'neural network': ['neural network', 'nn', 'two stage neural network'],
    'hidden markov model': ['hidden markov model'],
    'pca': ['pca'],
    'vae': ['vae'],
    'regression': ['cox regression', 'gaussian regression', 'regression plane'],
    'clustering': ['k-means', 'hierarchical', 'pam', 'spectral clustering'],
    'other': ['weka', 'deep learning', 'transfer learning', 'diffusion', 'classification', 'word2vec', 'adam', 'deepannotation']
}

METHOD_TO_CATEGORY = {
    # Traditional ML
    "svm": "Traditional ML",
    "knn": "Traditional ML",
    "rf": "Traditional ML",
    "xgboost": "Traditional ML",
    "lightgbm": "Traditional ML",
    "logistic regression": "Traditional ML",
    "linear regression": "Traditional ML",
    "decision tree": "Traditional ML",
    "gradient boosting": "Traditional ML",

    # Statistical Methods
    "lasso": "Statistical Methods",
    "ridge regression": "Statistical Methods",
    "elastic net": "Statistical Methods",
    "regression": "Statistical Methods",
    "pca": "Statistical Methods",

    # Deep Learning
    "cnn": "Deep Learning",
    "gnn": "Deep Learning",
    "mlp": "Deep Learning",
    "dnn": "Deep Learning",
    "transformer": "Deep Learning",
    "rnn": "Deep Learning",
    "lstm": "Deep Learning",
    "vae": "Deep Learning",
    "autoencoder": "Deep Learning",
    "ann": "Deep Learning",
    "neural network": "Deep Learning",

    # Bayesian
    "naive bayes": "Bayesian / Probabilistic",
    "bayesian": "Bayesian / Probabilistic",
    "hidden markov model": "Bayesian / Probabilistic",

    # Ensemble
    "stacking": "Ensemble Methods",

    # Clustering / Unsupervised
    "clustering": "Unsupervised Learning",

    # Catch-all
    "other": "Other / Unclassified"
}

CATEGORY_TO_METHOD = {
    'Traditional ML': [
        'svm', 'knn', 'rf', 'xgboost', 'lightgbm',
        'logistic regression', 'linear regression',
        'decision tree', 'gradient boosting'
    ],
    'Statistical Methods': [
        'lasso', 'ridge regression', 'elastic net',
        'regression', 'pca'
    ],
    'Deep Learning': [
        'cnn', 'gnn', 'mlp', 'dnn', 'transformer',
        'rnn', 'lstm', 'vae', 'autoencoder', 'ann',
        'neural network'
    ],
    'Bayesian / Probabilistic': [
        'naive bayes', 'bayesian', 'hidden markov model'
    ],
    'Ensemble Methods': ['stacking'],
    'Unsupervised Learning': ['clustering'],
    'Other / Unclassified': ['other']
}


METHOD_TO_CATEGORY_2 = {
    "svm": "Kernel-based Methods",
    "cnn": "Deep Learning Architectures",
    "gnn": "Deep Learning Architectures",
    "mlp": "Neural Networks",
    "dnn": "Neural Networks",
    "knn": "Instance-based Methods",
    "rf": "Tree-based Methods",
    "xgboost": "Tree-based Methods",
    "lightgbm": "Tree-based Methods",
    "logistic regression": "Linear Models",
    "linear regression": "Linear Models",
    "ridge regression": "Linear Models",
    "lasso": "Linear Models",
    "elastic net": "Linear Models",
    "naive bayes": "Bayesian Methods",
    "bayesian": "Bayesian Methods",
    "transformer": "Deep Learning Architectures",
    "autoencoder": "Neural Networks",
    "stacking": "Ensemble / Meta Methods",
    "decision tree": "Tree-based Methods",
    "gradient boosting": "Tree-based Methods",
    "rnn": "Deep Learning Architectures",
    "lstm": "Deep Learning Architectures",
    "ann": "Neural Networks",
    "neural network": "Neural Networks",
    "hidden markov model": "Bayesian Methods",
    "pca": "Dimensionality Reduction",
    "vae": "Deep Generative Models",
    "regression": "Linear Models",
    "clustering": "Clustering Methods",
    "other": "Other / Unclassified"
}

CATEGORY_TO_METHOD_2 = {
    'Kernel-based Methods': ['svm'],
    'Deep Learning Architectures': ['cnn', 'gnn', 'transformer', 'rnn', 'lstm'],
    'Neural Networks': ['mlp', 'dnn', 'autoencoder', 'ann', 'neural network'],
    'Instance-based Methods': ['knn'],
    'Tree-based Methods': ['rf', 'xgboost', 'lightgbm', 'decision tree', 'gradient boosting'],
    'Linear Models': [
        'logistic regression', 'linear regression', 'ridge regression',
        'lasso', 'elastic net', 'regression'
    ],
    'Bayesian Methods': ['naive bayes', 'bayesian', 'hidden markov model'],
    'Ensemble / Meta Methods': ['stacking'],
    'Dimensionality Reduction': ['pca'],
    'Deep Generative Models': ['vae'],
    'Clustering Methods': ['clustering'],
    'Other / Unclassified': ['other']
}
