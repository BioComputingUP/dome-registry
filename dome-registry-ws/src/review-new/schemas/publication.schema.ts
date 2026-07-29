import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PublicationNew } from 'dome-registry-core';

@Schema({ _id: false })
class PublicationNewSchema implements PublicationNew {
    @Prop({ type: String, required: true })
    pmid: string;

    @Prop({ type: String, required: true })
    journal: string;

    @Prop({ type: String, required: true })
    year: string;

    @Prop({ type: String, required: true })
    doi: string;

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    authors: string;

    @Prop({ type: [String], required: false })
    tags?: string[];

    @Prop({ type: String, required: true })
    pmcid: string;
}

const PublicationNewSchemaFactory = SchemaFactory.createForClass(PublicationNewSchema);

export {
    PublicationNewSchema,
    PublicationNewSchemaFactory
};
