import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { DataAvailability, DataProvenance, DataRedundancy, DataSplits, DataSection } from 'dome-registry-core';

@Schema({ _id: false })
class DataAvailabilitySchema implements DataAvailability {
    @Prop({ type: Boolean, required: false })
    isPublic: boolean;

    @Prop({ type: String, required: false })
    licence: string;

    
    @Prop({ type: String, required: false })
    enforceMethod: string;
}

@Schema({ _id: false })
class DataProvenanceSchema implements DataProvenance {
    @Prop({ type: String, required: false })
    source: string;

    @Prop({ type: String, required: false })
    numDataPoints: string;

    @Prop({ type: Boolean, required: false })
    isPrevUse: boolean;
}

@Schema({ _id: false })
class DataRedundancySchema implements DataRedundancy {
    @Prop({ type: String, required: false })
    splitMethod: string;

    @Prop({ type: Boolean, required: false })
    isIndependent: boolean;

    @Prop({ type: String, required: false })
    enforceMethod: string;

    @Prop({ type: String, required: false })
    distributionComp: string;
}

@Schema({ _id: false })
class DataSplitsSchema implements DataSplits {
    @Prop({ type: String, required: false })
    numSplits: string;

    @Prop({ type: String, required: false })
    dataPointsPerSplit: string;

    @Prop({ type: String, required: false })
    otherSplits: string;

    @Prop({ type: String, required: false })
    splitDist: string;
}

@Schema({ _id: false })
class DataSectionSchema implements DataSection {
    @Prop({ type: DataAvailabilitySchema, required: true })
    availability: DataAvailability;

    @Prop({ type: DataProvenanceSchema, required: true })
    provenance: DataProvenance;

    @Prop({ type: DataRedundancySchema, required: true })
    redundancy: DataRedundancy;

    @Prop({ type: DataSplitsSchema, required: true })
    splits: DataSplits;

    @Prop({ type: Number, required: false })
    done?: number;

    @Prop({ type: Number, required: false })
    skip?: number;
}

const DataAvailabilitySchemaFactory = SchemaFactory.createForClass(DataAvailabilitySchema);
const DataProvenanceSchemaFactory = SchemaFactory.createForClass(DataProvenanceSchema);
const DataRedundancySchemaFactory = SchemaFactory.createForClass(DataRedundancySchema);
const DataSplitsSchemaFactory = SchemaFactory.createForClass(DataSplitsSchema);
const DataSectionSchemaFactory = SchemaFactory.createForClass(DataSectionSchema);

export {
    DataAvailabilitySchema,
    DataProvenanceSchema,
    DataRedundancySchema,
    DataSplitsSchema,
    DataSectionSchema,
    DataAvailabilitySchemaFactory,
    DataProvenanceSchemaFactory,
    DataRedundancySchemaFactory,
    DataSplitsSchemaFactory,
    DataSectionSchemaFactory
};
