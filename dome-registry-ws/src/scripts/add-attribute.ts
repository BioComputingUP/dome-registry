import {NestFactory} from "@nestjs/core"
import {MongooseModule, getModelToken} from "@nestjs/mongoose";
import mongoose from "mongoose";
import {AppModule} from "src/app.module"
//import { ReviewModule } from "src/review/review.module";
//import { Review, ReviewDocument } from "src/review/review.schema";
import {User, UserDocument} from "src/user/user.schema";
//import { ReviewService } from "src/review/review.service";
import {Role} from "src/roles/role.enum";
import {Review, ReviewDocument} from "src/review/review.schema";

// NODE_ENV= Developement node script.js


async function bootstrap() {
   
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        // Add score field to all documents that don't have it
        const updateResult = await reviewModel.updateMany(
            { score: { $exists: false } },  // Find documents without score field
            { $set: { score: 0 } }          // Set score to 0
        );

        console.log(`Updated ${updateResult.modifiedCount} documents with score field`);
    } catch (error) {
        console.error('Error updating documents:', error);
    } finally {
        await app.close();
    }


  
}

bootstrap()