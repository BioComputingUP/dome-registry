import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { ModelAvailability, ModelDuration, ModelInterpretability, ModelOutput, ModelSection } from 'dome-registry-core';

@Schema({ _id: false })
class ModelAvailabilitySchema implements ModelAvailability {
    @Prop({ type: Boolean, required: false })
    isCodeAvail: boolean;

    @Prop({ type: Boolean, required: false })
    isExecAvailable: boolean;

    @Prop({ type: String, required: false })
    licence: string;
}

@Schema({ _id: false })
class ModelDurationSchema implements ModelDuration {
    @Prop({ type: String, required: false })
    runTime: string;
}

@Schema({ _id: false })
class ModelInterpretabilitySchema implements ModelInterpretability {
    @Prop({ type: String, required: false })
    interpType: string;

    @Prop({ type: String, required: false })
    transpExp: string;
}

@Schema({ _id: false })
class ModelOutputSchema implements ModelOutput {
    @Prop({ type: String, required: false })
    outType: string;
}

@Schema({ _id: false })
class ModelSectionSchema implements ModelSection {
    @Prop({ type: ModelAvailabilitySchema, required: true })
    availability: ModelAvailability;

    @Prop({ type: ModelDurationSchema, required: true })
    duration: ModelDuration;

    @Prop({ type: ModelInterpretabilitySchema, required: true })
    interpretability: ModelInterpretability;

    @Prop({ type: ModelOutputSchema, required: true })
    output: ModelOutput;

    @Prop({ type: Number, required: false })
    done?: number;

    @Prop({ type: Number, required: false })
    skip?: number;
}

const ModelAvailabilitySchemaFactory = SchemaFactory.createForClass(ModelAvailabilitySchema);
const ModelDurationSchemaFactory = SchemaFactory.createForClass(ModelDurationSchema);
const ModelInterpretabilitySchemaFactory = SchemaFactory.createForClass(ModelInterpretabilitySchema);
const ModelOutputSchemaFactory = SchemaFactory.createForClass(ModelOutputSchema);
const ModelSectionSchemaFactory = SchemaFactory.createForClass(ModelSectionSchema);

export {
    ModelAvailabilitySchema,
    ModelDurationSchema,
    ModelInterpretabilitySchema,
    ModelOutputSchema,
    ModelSectionSchema,
    ModelAvailabilitySchemaFactory,
    ModelDurationSchemaFactory,
    ModelInterpretabilitySchemaFactory,
    ModelOutputSchemaFactory,
    ModelSectionSchemaFactory
};
