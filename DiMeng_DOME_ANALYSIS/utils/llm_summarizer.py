from transformers import AutoTokenizer, AutoModelForCausalLM
import torch

class Summarizer:
    def __init__(self, model_name="deepseek-ai/deepseek-coder-1.3b-base", task = "dataset.availability"):
        '''
        task - area.subArea, e.g. dataset.availability
        '''
        self.max_new_tokens = 1
        self.model_name = model_name
        self.task = task
        self.tokenizer = AutoTokenizer.from_pretrained(model_name)

        if torch.cuda.is_available():
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float16,
                device_map="auto"
            )
            print("Using CUDA!")
        else:
            self.model = AutoModelForCausalLM.from_pretrained(
                model_name,
                torch_dtype=torch.float32 # not support float16 on CPU.
            )
            print("Using CPU!")
            
    def change_task(self, new_task):
        self.task = new_task
    
    def _build_prompt(self, user_answer):
        '''
        Build prompts for different tasks. 
        
        '''
        if self.task == "dataset.availability":
            few_shot = """
Lable the following data availability answers in one word ("yes" or "no" or "request"):

Answer: Yes : data to reproduce the results can be downloaded from GitHub (https://github.com/ggonzalezp/hyperfoods)
Label: yes

Answer: Privacy.
Label: no

Answer: Yes, Upon reasonable request.
Label: request

Answer: Dataset1 is available but dataset2 is not .
Label: yes

Answer: Yes (GEO: https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE152075)
Label: yes

Answer: Contact hoganca@stanford.edu is provided in the paper for data access.
Label: request

Answer: The data and code generated during this study were made available at https://github.com/stanfordmlgroup/influenza-qtof.
Label: yes

Answer: {}
label:""".format(user_answer.strip())
        elif self.task == "dataset.license":
            few_shot = """
Determine whether the dataset clearly includes a license. Only respond with 'yes' if a license type is explicitly stated (e.g. CC-BY, CC0, MIT, GPL, DUO, etc.). Otherwise, respond with 'no'.

Answer: All data are available at https://zenodo.org/record/1234567 under a CC-BY license.
Label: yes

Answer: Publicly accessible at https://gdc.cancer.gov/data. Usage license: CC0.
Label: yes

Answer: Yes. Dataset ID: EGAD00001000200; license: DUO:0000005, DUO:0000026
Label: yes

Answer: Available from the authors upon request, no license mentioned.
Label: no

Answer: Data are hosted on GitHub but no license is provided.
Label: no

Answer: Downloadable from https://data.org/repo. No mention of license.
Label: no

Answer: Open access under the MIT license.
Label: yes

Answer: yea, All data are available at https://zenodo.org/record/1234567.
Label: no

Answer: yes, Publicly accessible at https://gdc.cancer.gov/data..
Label: no

Answer: Yes, Github https://gdc.cancer.gov/data..
Label: no

Answer: Yes.
Label: no

Answer: Yes, Upon request from author.
Label: no

Answer: {}
Label:""".format(user_answer.strip())
        elif self.task == "optimization.algorithm":
            few_shot = """
Extract all machine learning algorithms mentioned in the answer. Use a comma-separated list. Only include known algorithms such as:
[RNN, BiRNN, ADABOOST, AUTOENCODER, BAYESIAN, CNN, CONVOLUTIONAL NEURAL NETWORK, DECISION TREE, DEEP LEARNING, DNN, ELASTIC NET, GNN, GRADIENT BOOSTING, GRAPH NEURAL NETWORK, GRU, HIDDEN MARKOV MODEL, K-NEAREST NEIGHBORS, KNN, LASSO, LIGHTGBM, LINEAR REGRESSION, LOGISTIC REGRESSION, LSTM, MASK R-CNN, MLP, MULTI-LAYER PERCEPTRON, NAIVE BAYES, RANDOM FOREST, RESNET, RIDGE REGRESSION, STACKING, SUPPORT VECTOR MACHINE, SVM, TRANSFORMER, U-NET, XGBOOST, K-MEANS].

Answer: A Multi-Layer Perceptron and SVM were used for classification.
Label: MLP, SVM

Answer:The neural network topology employed in SPOT-Disorder2 consists of various models sequentially combining IncReSeNet, LSTM, and fully-connected (FC) topographical segments.
Label: LSTM, IncReSeNet

Answer: BiRNN has been used to predict a disorder consensus score from sequence.
Label: BiRNN

Answer: NeProc combined neural networks and support vector machines (SVM)
Label: SVM, neural network

Answer: CatBoost gradient boosted decision trees
Label: GRADIENT BOOSTING

Answer: Iterative Bayesian Model Averaging (BMA) algorithm.
Label: BAYESIAN

Answer: J48 Algorithm For Decision Tree (WEKA)   Decision tree J48 is the implementation of algorithm ID3 (Iterative Dichotomiser 3) developed by the WEKA project team. 
Label: Decision Tree

Answer: GPT 2. It is novel generative zero-shot approach to standard ML algorithms. Performance of the algorithm is compared to other ML methods.  We provide implementations for all methods used
Label: Transformer, GPT 2

Answer: Gaussian Process Regression
Lable: gaussian regression

Answer: Random forest and logistic regression models.
Label: RANDOM FOREST, LOGISTIC REGRESSION
###
Answer: {}
Label:""".format(user_answer.strip())
            self.max_new_tokens = 30
        
        elif self.task == "optimization.meta":
            few_shot = """
        Determine if the model use data from other ML algorithms as input. Label with 'yes' or 'no'.

        Answer: pLDDT and RSA from AlphaFold2 are used in the features.
        Label: yes
        
        Answer: The model uses outputs from DISOPRED3. .
        Label: yes

        Answer: Feature selection operated using ML. The set used for feature selection is the same used for the training of the classifier, but the validation for the classifier is operated on independent dataset (Dataset 2 and 3).
        Label: yes

        Answer: Only raw sequence data.
        Label: no

        Answer: We used raw structural data only, without leveraging any other ML outputs.
        Label: no

        Answer: No data is used from other predictors, but the 5 predictors are used together as an ensemble to identify the most predictive features, i.e. the molecules useful for separating cases with good prognosis from bas ones
        Label: no
        
        Answer: Features are coming from experimental data.  Four different predictors using different data are grouped in a stacked ensemble classifier, using Naive Bayes. 
        Label: no
        
        Answer: Predictions from SPOT-disorder-single are used.  
        Label: yes

        Answer: {}
        Label:""".format(user_answer.strip())
        elif self.task == "optimization.config":
            few_shot = """
Determine whether the model configuration is available (this includes architecture, hyperparameters, or training settings). Answer with 'yes' or 'no'.

Answer: No
Summary: no

Answer: Yes. Hyperparameter settings for every method are reported. For neural models, hyperparameter candidates can be found in Table 1, Characteristics of the neural network models architecture can be found in text.
Summary: yes

Answer: Authors state that BigML models will be shared without limitations.
Summary: yes

Answer: Supplementary Information
Summary: yes

Answer: 1) No 2) no
Summary: no

Answer: Code is available on GitHub (haven't checked it)
Summary: yes

Answer: Some hyperparameters specified in the main text
Summary: yes

Answer: heuristic hyperparameter initialization methods
Summary: no

Answer: The overall architecture is available in supporting information and released in github (https://github.com/fusong-ju/ProFOLD). Webserver is indicated but not functional.
Summary: yes

Answer: Yes, the 6 parameters resulted from training are reported on the paper
Summary: yes

Answer: {}
Summary:""".format(user_answer.strip())
        elif self.task == "model.availability":
            few_shot = """
Determine the availability of the predictor. Label as:
- "yes" → if a working link, GitHub repo, or clear public availability is stated.
- "request" → if it’s available only upon request or conditional access.
- "no" → if it is not available or unclear.

Answer: Standard algorithms are used.
Summary: no

Answer: http://www.cogsys.cs.uni-tuebingen.de/software/dna-methylation/.
Summary: yes

Answer: The software system implementing NetiNeti can be accessed at http://namefinding.ubio.org.
Summary: yes

Answer: No
Summary: no

Answer: Method and data are available to the public upon request.
Summary: request

Answer: Broken link (http://dendrome.ucdavis.edu/adept2/resequencing.html). The customized pipeline for feature extraction is reported in a new link: https://nealelab.ucdavis.edu/adept2-overview/pinesap/
Summary: yes

Answer: Yes. Web server: https://sunflower.kuicr.kyoto-u.ac.jp/~jbbrown/dnaRepairPrediction/v2/index.py
Summary: yes

Answer: Upon request (but did not try to get it, there is a link to a tar file with, it says, C++ and Python for the Riptide part, I did not examine the files)
Summary: request

Answer: No
Summary: no

Answer: Weka
Summary: yes

Answer: Yes, available at https://github.com/guoang4github/ROIforMSI/ (Licence: GPL-3)
Summary: yes

Answer: Yes the source code for our testing is here: https://gitlab.com/tjobbertjob/ms-review-paper with the underlying code being available here: https://gitlab.com/roettgerlab/ms2ai
Summary: yes

Answer: Yes (GitHub, https://github.com/moziya/DeepERA)
Summary: yes

Answer: {}
Summary:""".format(user_answer.strip())

        elif self.task == "model.license":
            few_shot = """
Determine whether a software/model/predictor license is mentioned or implied in the user's response. Label with 'yes' or 'no'.

- Label as 'yes' if there is any mention of a license (e.g., MIT, GPL, Apache), or a phrase like "licensed", "under a license", or "with a license".
- Label as 'no' if there is no indication of a license, or the availability is vague or unspecified.
- Do not require the word "yes" to be present.

Answer: The software is available on GitHub under a GPL license.
Summary: yes

Answer: Source code is shared and licensed under Apache 2.0.
Summary: yes

Answer: The model is open source, and the license file is included in the repo.
Summary: yes

Answer: The method is public, but the license is not specified.
Summary: no

Answer: We used open-source tools but don't mention license terms.
Summary: no

Answer: The model can be accessed through the webserver.
Summary: no

Answer: {}
Summary:""".format(user_answer.strip())


        else:
            raise NotImplementedError(f"Task '{self.task}' not supported.")
        
        return few_shot
    
    def summarize(self, answer):
        prompt = self._build_prompt(answer)
        inputs = self.tokenizer(prompt, return_tensors="pt")
        eos_token_id = self.tokenizer.eos_token_id
        
        if torch.cuda.is_available():
            inputs = {k: v.to("cuda") for k, v in inputs.items()}
            self.model.to("cuda")

        with torch.no_grad():
            output = self.model.generate(
                **inputs,
                max_new_tokens=self.max_new_tokens,
                eos_token_id=eos_token_id,  # stop when EOS is generated
                do_sample=False
            )

        result = self.tokenizer.decode(
            output[0][inputs['input_ids'].shape[1]:],
            skip_special_tokens=True
        ).strip().lower()
        
        result = result.strip().splitlines()[0].strip()
        
        if self.task=="optimization.algorithm":
            result = [w.strip().lower() for w in result.split(",") if w.strip()]
            print(result)
        return result
    
