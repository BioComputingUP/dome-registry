import { User } from "./review";
export interface DataAvailability {
    isPublic: boolean;
    licence: string;
}
export interface DataProvenance {
    source: string;
    numDataPoints: string;
    isPrevUse: boolean;
}
export interface DataRedundancy {
    splitMethod: string;
    isIndependent: boolean;
    enforceMethod: string;
    distributionComp: string;
}
export interface DataSplits {
    numSplits: string;
    dataPointsPerSplit: string;
    otherSplits: string;
    splitDist: string;
}
export interface DataSection {
    availability: DataAvailability;
    provenance: DataProvenance;
    redundancy: DataRedundancy;
    splits: DataSplits;
}
export interface OptimizationAlgorithm {
    algName: string;
    isNewAlg: boolean;
    algPrevPublished: string;
}
export interface OptimizationConfig {
    isAvailable: boolean;
    licence: string;
}
export interface OptimizationEncoding {
    encMethod: string;
}
export interface OptimizationFeatures {
    numFeatures: string;
    featSelection: boolean;
    trainingOnlySelection: boolean;
}
export interface OptimizationFitting {
    isParamsLarger: boolean;
    noOverFit: string;
    noUnderFit: string;
}
export interface OptimizationMeta {
    isMeta: boolean;
    metaMethods: string;
    metaIndep: boolean;
}
export interface OptimizationParameters {
    numParams: string;
    pSelMeth: string;
}
export interface OptimizationRegularization {
    hasReg: boolean;
    regTechs: string;
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
export interface ModelAvailability {
    isCodeAvail: boolean;
    isExecAvailable: boolean;
    licence: string;
}
export interface ModelDuration {
    runTime: string;
}
export interface ModelInterpretability {
    interpType: string;
    transpExp: string;
}
export interface ModelOutput {
    outType: string;
}
export interface ModelSection {
    availability: ModelAvailability;
    duration: ModelDuration;
    interpretability: ModelInterpretability;
    output: ModelOutput;
}
export interface EvaluationMethod {
    evalMethod: string;
}
export interface EvaluationAvailability {
    isRawAvail: boolean;
    licence: string;
}
export interface EvaluationComparison {
    hasPublicComparison: boolean;
    hasBaseComparison: boolean;
}
export interface EvaluationConfidence {
    confidenceInterval: boolean;
    statSignificant: boolean;
}
export interface EvaluationMeasure {
    metrics: string;
    isRepresentative: boolean;
}
export interface EvaluationSection {
    method: EvaluationMethod;
    availability: EvaluationAvailability;
    comparison: EvaluationComparison;
    confidance: EvaluationConfidence;
    measure: EvaluationMeasure;
}
export interface Sectionn {
    done: number;
    skip: number;
}
export interface PublicationNew {
    pmid: string;
    journal: string;
    year: string;
    doi: string;
    title: string;
    authors: string;
    tags?: string[];
    pmcid: string;
}
export interface ReviewNew {
    shortid: string;
    uuid: string;
    created: number;
    updated: number;
    publication: PublicationNew;
    data: DataSection;
    optimization: OptimizationSection;
    model: ModelSection;
    evaluation: EvaluationSection;
    user: User;
    public: boolean;
    isAiGenerated: boolean;
}
export declare const notDefinedValues2: string[];
/**
 * Check if a field value is considered valid (not in the list of undefined values)
 * @param name - Field name (for context)
 * @param value - Field value to validate
 * @returns true if the field is valid, false otherwise
 */
export declare function isValidField2(name: string, value: any): boolean;
/**
 * Get number of valid entries in a section
 * @param section - Object representing a section with fields to validate
 * @returns Tuple of [valid count, invalid count]
 */
export declare function countValidFields2(section: Record<string, any>): [number, number];
/**
 * Flatten a nested section object to a simple key-value pair for scoring
 * @param section - Nested section object
 * @param prefix - Prefix for flattened keys
 * @returns Flattened object
 */
export declare function flattenSection(section: Record<string, any>, prefix?: string): Record<string, any>;
/**
 * Compute DOME score for new review structure
 * @param review - ReviewNew object
 * @returns Map of section names to [valid, invalid] tuples, including total score
 */
export declare function computeDomeScorerNew(review: ReviewNew): Map<string, [number, number]>;
