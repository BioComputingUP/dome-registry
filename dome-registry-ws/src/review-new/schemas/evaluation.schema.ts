import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { EvaluationMethod, EvaluationAvailability, EvaluationComparison, EvaluationConfidence, EvaluationMeasure, EvaluationSection } from 'dome-registry-core';

@Schema({ _id: false })
class EvaluationMethodSchema implements EvaluationMethod {
    @Prop({ type: String, required: false })
    evalMethod: string;
}

@Schema({ _id: false })
class EvaluationAvailabilitySchema implements EvaluationAvailability {
    @Prop({ type: Boolean, required: false })
    isRawAvail: boolean;

    @Prop({ type: String, required: false })
    licence: string;
}

@Schema({ _id: false })
class EvaluationComparisonSchema implements EvaluationComparison {
    @Prop({ type: Boolean, required: false })
    hasPublicComparison: boolean;

    @Prop({ type: Boolean, required: false })
    hasBaseComparison: boolean;
}

@Schema({ _id: false })
class EvaluationConfidenceSchema implements EvaluationConfidence {
    @Prop({ type: Boolean, required: false })
    confidenceInterval: boolean;

    @Prop({ type: Boolean, required: false })
    statSignificant: boolean;
}

@Schema({ _id: false })
class EvaluationMeasureSchema implements EvaluationMeasure {
    @Prop({ type: String, required: false })
    metrics: string;

    @Prop({ type: Boolean, required: false })
    isRepresentative: boolean;
}

@Schema({ _id: false })
class EvaluationSectionSchema implements EvaluationSection {
    @Prop({ type: EvaluationMethodSchema, required: true })
    method: EvaluationMethod;

    @Prop({ type: EvaluationAvailabilitySchema, required: true })
    availability: EvaluationAvailability;

    @Prop({ type: EvaluationComparisonSchema, required: true })
    comparison: EvaluationComparison;

    @Prop({ type: EvaluationConfidenceSchema, required: true })
    confidance: EvaluationConfidence;

    @Prop({ type: EvaluationMeasureSchema, required: true })
    measure: EvaluationMeasure;

    @Prop({ type: Number, required: false })
    done?: number;

    @Prop({ type: Number, required: false })
    skip?: number;
}

const EvaluationMethodSchemaFactory = SchemaFactory.createForClass(EvaluationMethodSchema);
const EvaluationAvailabilitySchemaFactory = SchemaFactory.createForClass(EvaluationAvailabilitySchema);
const EvaluationComparisonSchemaFactory = SchemaFactory.createForClass(EvaluationComparisonSchema);
const EvaluationConfidenceSchemaFactory = SchemaFactory.createForClass(EvaluationConfidenceSchema);
const EvaluationMeasureSchemaFactory = SchemaFactory.createForClass(EvaluationMeasureSchema);
const EvaluationSectionSchemaFactory = SchemaFactory.createForClass(EvaluationSectionSchema);

export {
    EvaluationMethodSchema,
    EvaluationAvailabilitySchema,
    EvaluationComparisonSchema,
    EvaluationConfidenceSchema,
    EvaluationMeasureSchema,
    EvaluationSectionSchema,
    EvaluationMethodSchemaFactory,
    EvaluationAvailabilitySchemaFactory,
    EvaluationComparisonSchemaFactory,
    EvaluationConfidenceSchemaFactory,
    EvaluationMeasureSchemaFactory,
    EvaluationSectionSchemaFactory
};
