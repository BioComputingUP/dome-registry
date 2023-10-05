import { NestApplication, NestApplicationContext, NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { AppModule } from "../app.module";
import { Review, ReviewDocument } from "../review/review.schema";
import { computeDomeScore } from "dome-registry-core"
import { Model } from "mongoose";
async function bootstrap() {


    const app = await NestFactory.createApplicationContext(AppModule);


    const reviewModel: Model<ReviewDocument> = app.get(getModelToken(Review.name));



    const reviewList = reviewModel.find().cursor()


    for await (const review of reviewList) {


        const reviewObject = review.toObject()
        const scores = computeDomeScore(reviewObject as any)

        scores.delete('total');

        scores.forEach(([done, skip], section) => {
            // Update section
            review[section]['done'] = done;
            review[section]['skip'] = skip;
            review.markModified(section);
        });

        const res = await review.save();

        console.log(res)

    }
  await app.close();

    // Get on one model and update the score

    // const review = await reviewModel.findOne({ uuid: '8becb7c4-2b09-4c8a-b48f-eb340481376d' })
    // console.log(computeDomeScore())



    // const reviews = reviewModel.find().cursor();



   







    // const review = await reviewModel.findOne({ uuid: '8becb7c4-2b09-4c8a-b48f-eb340481376d' });

    // console.log(review)

    // let scores = computeDomeScore(review.toObject() as any);
    // console.log(scores)

    // await app.close()


    // scores.delete('total');

    // scores.forEach(([done, skip], section) => {
    //     review[section]['done'] = done;
    //     review[section]['skip'] = skip;
    //     review.markModified(section)
    // })

    // console.log(scores);

    // const saved = await review.save();

    // console.log({ saved })

    // await app.close();

}


bootstrap();