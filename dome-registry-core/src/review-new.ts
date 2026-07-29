import { User } from "./review";

// Data Section Interfaces
export interface DataAvailability {
    isPublic: boolean;           // Are the data, including the data splits used, released in a public forum?
    licence: string;          // If yes, where and how (license)?
    
}

export interface DataProvenance {
    source: string;           // Source of the dataset?
    numDataPoints: string;            // Number of data points?
    isPrevUse: boolean;         // Data used in previous paper and/or by community?
}

export interface DataRedundancy {
    splitMethod: string;        // How were the datasets split?
    isIndependent: boolean;         // Are the training and test sets independent?
    enforceMethod: string;          // How was this enforced?
    distributionComp: string;          // How does the distribution compare to previously published ML datasets?
}

export interface DataSplits {
    numSplits: string;        // How many Data splits?
    dataPointsPerSplit: string;     // How many data points in each split
    otherSplits: string;      // If the number of data splits is greater than two (2), what were other splits?
    splitDist: string;        // What is the distribution of data points in each data splits
}

export interface DataSection {
    availability: DataAvailability;
    provenance: DataProvenance;
    redundancy: DataRedundancy;
    splits: DataSplits;
}

// Optimization Section Interfaces
export interface OptimizationAlgorithm {
    algName: string;          // What is the ML Algorithm used
    isNewAlg: boolean;        // Is the machine learning Algorithm new
    algPrevPublished: string;         // If its a new ML Algorithm, why its not published in a machine learning journal
}

export interface OptimizationConfig {
    isAvailable: boolean;        // Are the hyper-parameter configurations, optimization schedule, model files... available?
    licence: string;              // If yes, where and how (license)?
}

export interface OptimizationEncoding {
    encMethod: string;          // How was the data encoding and preprocessed an encoded for the machine learning algorithm
}

export interface OptimizationFeatures {
    numFeatures: string;             // How many features (f) are used as input?
    featSelection: boolean;         // Was feature selection performed?
    trainingOnlySelection: boolean;      // If feature selection was performed, was it done using the training set only?
}

export interface OptimizationFitting {
    isParamsLarger: boolean;            // Is the number of parameters much larger than the number of training points?
    noOverFit: string;        // If yes to the previous question, how was over-fitting ruled out?
    noUnderFit: string;       // Conversely, how was under-fitting ruled out?
}

export interface OptimizationMeta {
    isMeta: boolean;          // Does the model use data from other machine-learning algorithms as input?
    metaMethods: string;      // If it is a meta-predictor, which machine-learning methods constitute the whole?
    metaIndep: boolean;       // If it is a meta-predictor, is it completely clear that training data is independent?
}

export interface OptimizationParameters {
    numParams: string;             // How many parameters (p) are used in the model?
    pSelMeth: string;         // How was p selected?
}

export interface OptimizationRegularization {
    hasReg: boolean;          // Were any over-fitting prevention techniques performed?
    regTechs: string;       // If yes, which ones?
}

export interface OptimizationSection {
    algorithm: OptimizationAlgorithm;
    config: OptimizationConfig;
    encoding: OptimizationEncoding;
    features: OptimizationFeatures;
    fitting: OptimizationFitting;
    meta: OptimizationMeta;
    parameters: OptimizationParameters;
    regularisation: OptimizationRegularization;
}

// Model Section Interfaces
export interface ModelAvailability {
    isCodeAvail: boolean;        // Is the source code released?
    isExecAvailable: boolean;        // Is a method to run the algorithm such as executable, web server... released?
    licence: string;              // If yes to public release, where and how (license)?
}

export interface ModelDuration {
    runTime: string;          // How much time did it take for the model to run...?
}

export interface ModelInterpretability {
    interpType: string;       // Is the model blackbox or transparent?
    transpExp: string;         // If the model is transparent, can you give clear examples for this?
}

export interface ModelOutput {
    outType: string;          // Is the model classification or regression?
}

export interface ModelSection {
    availability: ModelAvailability;
    duration: ModelDuration;
    interpretability: ModelInterpretability;
    output: ModelOutput;
}

// Evaluation Section Interfaces
export interface EvaluationMethod {
    evalMethod: string;         // How was the method evaluated? (E.g. cross-validation, independent dataset...)
}

export interface EvaluationAvailability {
    isRawAvail: boolean;        // Are the raw evaluation files available?
    licence: string;              // If publicly released, where and how (license)?
}

export interface EvaluationComparison {
    hasPublicComparison: boolean;          // Was a comparison to publicly available methods performed on benchmark datasets?
    hasBaseComparison: boolean;         // Was a comparison to simpler baselines performed?
}

export interface EvaluationConfidence {
    confidenceInterval: boolean;           // Do the performance metrics have confidence intervals?
    statSignificant: boolean;       // Are the results statistically significant to claim that the method is superior...?
}

export interface EvaluationMeasure {
    metrics: string;        // Which performance metrics are reported?
    isRepresentative: boolean;           // Is this set of metrics representative (e.g. compared to the literature)?
}

export interface EvaluationSection {
    method: EvaluationMethod;
    availability: EvaluationAvailability;
    comparison: EvaluationComparison;
    confidance: EvaluationConfidence;     // Note: keeping typo from schema
    measure: EvaluationMeasure;
}



export interface Sectionn{
    done: number;
    skip: number;

}

// Publication Interface
export interface PublicationNew {
    // PubMedID of target paper
    pmid: string;
    // Journal containing target paper
    journal: string;
    // Publication year
    year: string;
    // DOI of the publication
    doi: string;
    // Title of the publication
    title: string;
    // Authors, comma separated
    authors: string;
    // Tags list related to the annotation
    tags?: string[];
    // PMCID of the publication
    pmcid: string;
}

// Main Review Interface
export interface ReviewNew {
    // External identifier (ShortuniqueId)
    shortid: string;
    // External identifier (UUID v4)
    uuid: string;
    // Chronological information
    created: number;
    updated: number;
    // Publication information
    publication: PublicationNew;
    // Data information
    data: DataSection;
    // Optimization information
    optimization: OptimizationSection;
    // Model information
    model: ModelSection;
    // Evaluation information
    evaluation: EvaluationSection;
    // User information
    user: User;
    // Whether review is public or not
    // NOTE Private reviews can be accessed only by their owners or The Admin or the person in charge of the journal
    public: boolean;
    // Whether review was AI-generated
    isAiGenerated: boolean;
}

// Define invalid strings
// NOTE Those have been defined as the most common N.A. values
export const notDefinedValues2 = [
    '', 'nd', 'na', 'not applicable', 'not available', 'not defined', 'not stated', 'not specified', 'none',
    'not mentioned', 'not explicitly stated', 'not provided', 'not reported', 'not stated', 'not given',
    'none provided', 'not available', 'unclear', 'not known', 'unknown', 'not applicable', 'not discussed', 'Inaccessible',
    'Unreachable', 'Unattainable', 'Unobtainable', 'Unacquirable', 'Unretrievable', 'Unapproachable', 'Unachievable',
    'Ungettable', 'Unsecurable', 'Unforthcoming', 'Unavailable', 'no', 'No', 'N/A', 'no.', 'n/a', 'nil', 'null',
    'undef', 'undefined', 'n.d.', 'tbd', 'tba', 'not apllicable', 'not availble', 'not specifed', 'unkown',
    'data not available', 'information not available', 'value not available', 'not disclosed', 'not recorded',
    'not assessed', 'not evaluated', 'not determined', 'not identified', 'not collected', 'missing', 'withheld',
    'redacted', 'dunno', 'nope', 'nada', 'zip', 'zilch', 'keine Angabe', 'sin dato', 'non disponible', 'нет данных',
    'unspecified', 'undetermined', 'unidentified', 'blank', 'empty', 'void', 'nonexistent', 'not relevant',
    'not in scope', 'out of scope', 'not covered', 'not included', 'not applicable here', 'not in the dataset'
];

/**
 * Check if a field value is considered valid (not in the list of undefined values)
 * @param name - Field name (for context)
 * @param value - Field value to validate
 * @returns true if the field is valid, false otherwise
 */
export function isValidField2(name: string, value: any): boolean {
    // Handle non-string values
    if (typeof value !== 'string') {
        return value !== null && value !== undefined && value !== '';
    }
    // Remove double spaces
    value = value.replace(/[ \t]+/g, ' ');
    // Remove special characters
    value = value.replace(/[/.]/, '');
    // Check if value falls in the list of the invalid ones
    return !notDefinedValues2.includes(value.toLowerCase());
}

/**
 * Get number of valid entries in a section
 * @param section - Object representing a section with fields to validate
 * @returns Tuple of [valid count, invalid count]
 */
export function countValidFields2(section: Record<string, any>): [number, number] {
    // Initialize number of defined and undefined entries
    let [valid, invalid] = [0, 0];
    // Loop through each field in section
    for (let [name, value] of Object.entries(section)) {
        // Skip nested objects and arrays
        if (typeof value === 'object' && value !== null) {
            continue;
        }
        // Case entry is valid
        if (isValidField2(name, value)) {
            // Update number of valid fields
            valid = valid + 1;
        }
        // Otherwise
        else {
            // Update number of invalid fields
            invalid = invalid + 1;
        }
    }
    // Return number of valid and invalid fields
    return [valid, invalid];
}

/**
 * Flatten a nested section object to a simple key-value pair for scoring
 * @param section - Nested section object
 * @param prefix - Prefix for flattened keys
 * @returns Flattened object
 */
export function flattenSection(section: Record<string, any>, prefix: string = ''): Record<string, any> {
    const flattened: Record<string, any> = {};
    
    for (const [key, value] of Object.entries(section)) {
        if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
            // Recursively flatten nested objects
            const nested = flattenSection(value, `${prefix}${key}.`);
            Object.assign(flattened, nested);
        } else {
            // Add primitive values and arrays
            flattened[`${prefix}${key}`] = value;
        }
    }
    
    return flattened;
}

/**
 * Compute DOME score for new review structure
 * @param review - ReviewNew object
 * @returns Map of section names to [valid, invalid] tuples, including total score
 */
export function computeDomeScorerNew(review: ReviewNew): Map<string, [number, number]> {
    // Initialize map section -> [valid, invalid] fields
    const score = new Map<string, [number, number]>();
    // Initialize values for total score
    let total: [number, number] = [0, 0];
    
    // Define sections to score (skip publication, user, uuid, shortid, created, updated, public, isAiGenerated)
    const sections = ['data', 'optimization', 'model', 'evaluation'];
    
    // Loop through each section
    for (const sectionName of sections) {
        const section = (review as any)[sectionName];
        
        if (section) {
            // Flatten nested structure for scoring
            const flattened = flattenSection(section);
            // Count valid and invalid fields
            const [valid, invalid] = countValidFields2(flattened);
            // Update score for this section
            score.set(sectionName, [valid, invalid]);
            // Update total score
            total = [total[0] + valid, total[1] + invalid];
        }
    }
    
    // Add total field
    score.set('total', total);
    
    // Return map section -> [valid, invalid]
    return score;
}
