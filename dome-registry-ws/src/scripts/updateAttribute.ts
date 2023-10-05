import { NestApplication, NestApplicationContext, NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { AppModule } from "../app.module";
import { Review, ReviewDocument } from "../review/review.schema";
import { computeDomeScore } from "dome-registry-core"
import { Model } from "mongoose";
import { skip } from "rxjs";

async function bootstrap() {


    const app = await NestFactory.createApplicationContext(AppModule);


    const reviewModel: Model<ReviewDocument> = app.get(getModelToken(Review.name));

    const reviews = reviewModel.find().cursor();

    for await (const review of reviews) {
       review.publication.done = 0;
       review.markModified('publication.done');

       const reply = await review.save();
       console.log({
        reply
       })
     
    }

    await app.close();


}

bootstrap();