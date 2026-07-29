import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import {
    PublicationNew,
    ReviewNew,
    computeDomeScorerNew,
    DataSection,
    OptimizationSection,
    ModelSection,
    EvaluationSection
} from 'dome-registry-core';
import { User } from '../user/user.schema';
import { ReviewState } from 'src/review-state/state.eum';
import { PublicationNewSchema, DataSectionSchema, OptimizationSectionSchema, ModelSectionSchema, EvaluationSectionSchema } from './schemas';

type ReviewNewDocument = ReviewNew & mongoose.Document;

@Schema({
    collection: 'reviews-new',
    discriminatorKey: 'public'
})
class ReviewNewModel implements ReviewNew {
    @Prop({ required: false })
    shortid: string;

    @Prop({ required: true })
    uuid: string;

    @Prop({ type: Date, required: true })
    created: number;

    @Prop({ type: Date, required: true })
    updated: number;

    @Prop({ required: true })
    public: boolean;

    @Prop({ type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true })
    user: User;

    @Prop({ type: PublicationNewSchema, required: true })
    publication: PublicationNew;

    @Prop({ type: DataSectionSchema, required: true })
    data: DataSection;

    @Prop({ type: OptimizationSectionSchema, required: true })
    optimization: OptimizationSection;

    @Prop({ type: ModelSectionSchema, required: true })
    model: ModelSection;

    @Prop({ type: EvaluationSectionSchema, required: true })
    evaluation: EvaluationSection;

    @Prop({ type: String, enum: ReviewState, default: ReviewState.Undefined })
    reviewState?: ReviewState;

    @Prop({ type: [String], required: false })
    tags: string[];

    @Prop({ type: Number, required: false })
    score: number;

    @Prop({ type: Boolean, required: false })
    isAiGenerated: boolean;
}

const ReviewNewSchema = SchemaFactory.createForClass(ReviewNewModel);

// Add pre-init hook on review schema
ReviewNewSchema.pre('init', function () {
    // DEBUG
    console.log('Pre-init', this);
});

// Add pre-save hook on review schema
ReviewNewSchema.pre('save', function () {
    // Define review
    let review = this.toObject() as ReviewNew;
    // Compute DOME score using new schema
    let score = computeDomeScorerNew(review);
    // Remove total score
    score.delete('total');
    // Update sections' scores in place
    let scoreAttribute = 0;
    score.forEach(([valid, invalid], section) => {
        // Update section
        this[section]['done'] = valid;
        this[section]['skip'] = invalid;
        scoreAttribute += valid;
    });

    this.score = scoreAttribute;
});

export {
    ReviewNewSchema,
    ReviewNewDocument,
    ReviewNewModel
}
