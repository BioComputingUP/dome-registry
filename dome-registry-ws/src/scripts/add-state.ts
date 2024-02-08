import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"

import { Review, ReviewDocument } from "src/review/review.schema";
//import { ReviewService } from "src/review/review.service";
import { ReviewState } from "src/review-state/state.eum";


async function bootstrap() {

    const app = await NestFactory.createApplicationContext(AppModule);

    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name))
 
    await reviewModel.updateMany( {},{$set:{"reviewState":ReviewState.Undefined}})



    await app.close();
}

bootstrap()