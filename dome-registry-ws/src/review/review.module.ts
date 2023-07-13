import {Module} from '@nestjs/common';
import {ReviewService} from './review.service';
import {ReviewController} from './review.controller';
import {MongooseModule} from "@nestjs/mongoose";
import {Review, ReviewDocument, ReviewSchema} from "./review.schema";
import {User, UserSchema} from "../user/user.schema";
import {UserModule} from "../user/user.module";
import {JwtService} from "@nestjs/jwt";

@Module({
    // Import module for Review schema
    // NOTE "name" refers to a static attribute, not a property (defined by decorator)
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        // MongooseModule.forFeatureAsync([{
        //     name: Review.name,
        //     // Define schema
        //     useFactory: () => {
        //         const schema = ReviewSchema;
        //         // TODO Compute DOME score before saving review
        //         schema.pre('save', (review) => {});
        //         // TODO Compute DOME score when retrieving review
        //         schema.pre('init', (review) => {});
        //     }
        // }]),
        MongooseModule.forFeature([{name: Review.name, schema: ReviewSchema}]),
        UserModule,
    ],
    controllers: [ReviewController],
    providers: [ReviewService, JwtService]
})
export class ReviewModule {
}
