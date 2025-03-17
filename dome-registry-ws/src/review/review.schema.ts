import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Publication, Dataset, Model, Optimization, Evaluation, computeDomeScore } from 'dome-registry-core';
import { User } from '../user/user.schema';
import { ReviewState } from 'src/review-state/state.eum';


type ReviewDocument = Review & mongoose.Document;

@Schema({
    collection: 'reviews',
    discriminatorKey: 'public'
})
class Review {
    @Prop({ required : false})
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

    @Prop({ type: Object, required: true })
    publication: Publication;

    @Prop({ type: Object, required: true })
    dataset: Dataset;

    @Prop({ type: Object, required: true })
    model: Model;

    @Prop({ type: Object, required: true })
    optimization: Optimization;

    @Prop({ type: Object, required: true })
    evaluation: Evaluation;

    @Prop({ type: String, enum:ReviewState ,default:ReviewState.Undefined})
    reviewState?: ReviewState;
   
    @Prop({type:[{type: String}], required:false})
    tags : any;

    @Prop({ type: Number, required: false })
    score : number;
  
}

const ReviewSchema = SchemaFactory.createForClass(Review);

// Add pre-init hook on review schema
ReviewSchema.pre('init', function () {
    // DEBUG
    console.log('Pre-init', this);
});

//Add pre-save hook on review schema
ReviewSchema.pre('save', function () {
    // Define review
    let review = this.toObject() as Review;
    // Compute DOME score
    let score = computeDomeScore(review);
    // Remove total score
    score.delete('total');
    // Update sections' scores in place
    let scoreAttribute = 0;
    score.forEach(([ done, skip ], section) => {
        // Update section
        this[section]['done'] = done;
        this[section]['skip'] = skip;

        scoreAttribute +=done;
    });

    this.score = scoreAttribute;
});


export {
    Review, ReviewSchema, ReviewDocument
}
