import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"

import { Review, ReviewDocument } from "src/review/review.schema";
//import { ReviewService } from "src/review/review.service";
import { ReviewState } from "src/review-state/state.eum";
import ShortUniqueId from "short-unique-id";

async function bootstrap() {

    const app = await NestFactory.createApplicationContext(AppModule);

    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name))
    const customDictionary = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
       ];
    //const dictionnary = '0123456789abcdefghijklmnopqrstuvwxyz';
     const uid = new ShortUniqueId({dictionary: customDictionary});
    

    await reviewModel.updateMany( {},{$set:{"shortid":this.uid.randomUUID(10)}});



    await app.close();
}

bootstrap()