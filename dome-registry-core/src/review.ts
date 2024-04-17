export interface Review {
    // External identifier (ShortuniqueId)
    shortid: string;

    // External identifier (UUID v4)
    uuid: string,
    // Chronological information
    created: number,
    updated: number,
    // Publication information
    publication: Publication,
    // Data information
    // TODO Data section should be repeated if there are multiple datasets
    dataset: Dataset,
    // Optimization information
    // TODO Optimization section should be repeated if there are multiple models
    optimization: Optimization,
    // TODO Model section should be repeated if there are multiple models
    // Model information
    model: Model,
    // Evaluation information
    evaluation: Evaluation,
    // User information
    user: User,
    // Whether review is public or not
    // NOTE Private reviews can be accessed only by their owners or The Admin or the person in charge of the journal
    public: boolean,
}

// Define invalid strings
// NOTE Those have been defined as the most common N.A. values
export const notDefinedValues = [
    '', 'nd', 'na', 'not applicable', 'not available', 'not defined', 'not stated', 'not specified', 'none',
    'not mentioned', 'not explicitly stated', 'not provided', 'not reported', 'not reported', 'not stated', 'not given',
    'none provided', 'not available', 'unclear', 'not known', 'unknown', 'not applicable', 'not discussed', 'Inaccessible',
     'Inaccessible', 'Unreachable', 'Unattainable', 'Unobtainable', 'Unacquirable', 'Unreachable', 'Unreachable', 
     'Unavailable', 'Unobtainable', 'Unreachable', 'Unretrievable', 'Unapproachable', 'Unreachable', 'Unachievable', 
     'Ungettable', 'Unsecurable', 'Unforthcoming', 'Ungettable',
     'Unreachable', 'Unretrievable','no','No','',
];

// True if field is not defined
export function isValidField(name: string, value: any): boolean {
    // Remove double spaces
    value = value.replace(/[ \t]+/, ' ');
    // Remove special characters
    value = value.replace(/[/.]/, '');
    // Check if value falls in the list of the invalid ones
    return !(notDefinedValues.includes(value));
}

// Get number of invalid entries in a section
export function countValidFields(section: Record<string, any>): [number, number] {
    // Initialize number of defined and ntd defined entries
    let [valid, invalid] = [0, 0];
    // Loop through each field in section
    for (let [name, value] of Object.entries(section)) {
        // Case entry is valid valid
        if (isValidField(name, value)) {
            // Update number of valid fields
            valid = valid + 1;
        }
        // Otherwise
        else {
            // Update number of invalid fields
            invalid = invalid + 1;
        }
    }
    // Return number of defined and not defined fields
    return [valid, invalid];
}

// Compute DOME score for review
export function computeDomeScore(review: Review): Map<string, [number, number]> {
    // Initialize sections
    let sections: Map<string, Record<string, any>>;
    // Define section names
    let names = [ 'publication','dataset', 'optimization', 'model', 'evaluation'];
    // Retrieve sections from given review
    sections = new Map<string, any>(Object.entries(review).filter(([name, _]) => names.includes(name)));
    // Remove done, skip fields
    sections.forEach((section, name) => {
        if(name !='publication'){
            
            // Extract done, skip properties
            let {done, skip, ...others} = section;
            // Remove only done, skip properties
            sections.set(name, others);
        }
    });
    // Remove user, update fields from publication section
    delete sections.get('publication')!['user'];
    delete sections.get('publication')!['updated'];
    // Initialize map section -> done, skipped fields
    let score = new Map<string, [number, number]>();
    // Initialize values for total score
    let total: [number, number] = [0, 0];
    // Loop through each section
    sections.forEach((section, name) => {
        if (name != 'publication'){
            
            // Compute number of valid, invalid fields
            let current = countValidFields(section);
            // Update current section
            score.set(name, current);
            // Update total score
            total = [total[0] + current[0], total[1] + current[1]];
        }
    });
    // Add total field
    score.set('total', total);
    // Finally, return map section -> done, skipped fields
    return score;
}


export interface User {
    roles?:string
    name?: string,
    orcid?: string,
    email?: string,
    organisation?:string,
}

export interface Section {
    // Define number of done inputs (number of non-ND)
    done: number,
    // Define number of skipped entries (number of ND)
    skip: number,
}

export interface Publication extends Section {
    // PubMedID of target paper
    pmid: string,
    // Journal containing target paper
    journal: string,
    // Publication year
    year: string,
    // DOI of the publication
    doi: string,
    // Title of the publication
    title: string,
    // Authors, comma separated
    authors: string,

    
}

// Description for input data
export interface Dataset extends Section {
    provenance: string,
    splits: string,
    redundancy: string,
    availability: string,
}

// Description for optimization method
export interface Optimization extends Section {
    algorithm: string,
    // Whether algorithm is a meta-predictor
    meta: string,
    // Information about encoding and pre-processing
    encoding: string,
    parameters: string,
    features: string,
    fitting: string,
    regularization: string,
    // Whether configuration is available
    config: string,
}

// Description for ML model
export interface Model extends Section {
    // Describes interpretability of the model
    interpretability: string,
    // Describes output format
    output: string,
    // Execution time
    duration: string,
    // Whether software is available
    availability: string,
}

// Description for evaluation
export interface Evaluation extends Section {
    // Defines evaluation method (e.g. cross-validation)
    method: string,
    // Defines which performance measure has been used
    measure: string,
    // Defines comparison with other methods
    comparison: string,
    // Defines evaluation confidence
    confidence: string,
    // Defines evaluation availability
    availability: string,
}
