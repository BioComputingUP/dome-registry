import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { OptimizationAlgorithm, OptimizationConfig, OptimizationEncoding, OptimizationFeatures, OptimizationFitting, OptimizationMeta, OptimizationParameters, OptimizationRegularization, OptimizationSection } from 'dome-registry-core';

@Schema({ _id: false })
class OptimizationAlgorithmSchema implements OptimizationAlgorithm {
    @Prop({ type: String, required: false })
    algName: string;

    @Prop({ type: Boolean, required: false })
    isNewAlg: boolean;

    @Prop({ type: String, required: false })
    algPrevPublished: string;
}

@Schema({ _id: false })
class OptimizationConfigSchema implements OptimizationConfig {
    @Prop({ type: Boolean, required: false })
    isAvailable: boolean;

    @Prop({ type: String, required: false })
    licence: string;
}

@Schema({ _id: false })
class OptimizationEncodingSchema implements OptimizationEncoding {
    @Prop({ type: String, required: false })
    encMethod: string;
}

@Schema({ _id: false })
class OptimizationFeaturesSchema implements OptimizationFeatures {
    @Prop({ type: String, required: false })
    numFeatures: string;

    @Prop({ type: Boolean, required: false })
    featSelection: boolean;

    @Prop({ type: Boolean, required: false })
    trainingOnlySelection: boolean;
}

@Schema({ _id: false })
class OptimizationFittingSchema implements OptimizationFitting {
    @Prop({ type: Boolean, required: false })
    isParamsLarger: boolean;

    @Prop({ type: String, required: false })
    noOverFit: string;

    @Prop({ type: String, required: false })
    noUnderFit: string;
}

@Schema({ _id: false })
class OptimizationMetaSchema implements OptimizationMeta {
    @Prop({ type: Boolean, required: false })
    isMeta: boolean;

    @Prop({ type: String, required: false })
    metaMethods: string;

    @Prop({ type: Boolean, required: false })
    metaIndep: boolean;
}

@Schema({ _id: false })
class OptimizationParametersSchema implements OptimizationParameters {
    @Prop({ type: String, required: false })
    numParams: string;

    @Prop({ type: String, required: false })
    pSelMeth: string;
}

@Schema({ _id: false })
class OptimizationRegularizationSchema implements OptimizationRegularization {
    @Prop({ type: Boolean, required: false })
    hasReg: boolean;

    @Prop({ type: String, required: false })
    regTechs: string;
}

@Schema({ _id: false })
class OptimizationSectionSchema implements OptimizationSection {
    @Prop({ type: OptimizationAlgorithmSchema, required: true })
    algorithm: OptimizationAlgorithm;

    @Prop({ type: OptimizationConfigSchema, required: true })
    config: OptimizationConfig;

    @Prop({ type: OptimizationEncodingSchema, required: true })
    encoding: OptimizationEncoding;

    @Prop({ type: OptimizationFeaturesSchema, required: true })
    features: OptimizationFeatures;

    @Prop({ type: OptimizationFittingSchema, required: true })
    fitting: OptimizationFitting;

    @Prop({ type: OptimizationMetaSchema, required: true })
    meta: OptimizationMeta;

    @Prop({ type: OptimizationParametersSchema, required: true })
    parameters: OptimizationParameters;

    @Prop({ type: OptimizationRegularizationSchema, required: true })
    regularisation: OptimizationRegularization;

    @Prop({ type: Number, required: false })
    done?: number;

    @Prop({ type: Number, required: false })
    skip?: number;
}

const OptimizationAlgorithmSchemaFactory = SchemaFactory.createForClass(OptimizationAlgorithmSchema);
const OptimizationConfigSchemaFactory = SchemaFactory.createForClass(OptimizationConfigSchema);
const OptimizationEncodingSchemaFactory = SchemaFactory.createForClass(OptimizationEncodingSchema);
const OptimizationFeaturesSchemaFactory = SchemaFactory.createForClass(OptimizationFeaturesSchema);
const OptimizationFittingSchemaFactory = SchemaFactory.createForClass(OptimizationFittingSchema);
const OptimizationMetaSchemaFactory = SchemaFactory.createForClass(OptimizationMetaSchema);
const OptimizationParametersSchemaFactory = SchemaFactory.createForClass(OptimizationParametersSchema);
const OptimizationRegularizationSchemaFactory = SchemaFactory.createForClass(OptimizationRegularizationSchema);
const OptimizationSectionSchemaFactory = SchemaFactory.createForClass(OptimizationSectionSchema);

export {
    OptimizationAlgorithmSchema,
    OptimizationConfigSchema,
    OptimizationEncodingSchema,
    OptimizationFeaturesSchema,
    OptimizationFittingSchema,
    OptimizationMetaSchema,
    OptimizationParametersSchema,
    OptimizationRegularizationSchema,
    OptimizationSectionSchema,
    OptimizationAlgorithmSchemaFactory,
    OptimizationConfigSchemaFactory,
    OptimizationEncodingSchemaFactory,
    OptimizationFeaturesSchemaFactory,
    OptimizationFittingSchemaFactory,
    OptimizationMetaSchemaFactory,
    OptimizationParametersSchemaFactory,
    OptimizationRegularizationSchemaFactory,
    OptimizationSectionSchemaFactory
};
