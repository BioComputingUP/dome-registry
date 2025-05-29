import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
import { ReviewModule } from "src/review/review.module";
import { Review, ReviewDocument } from "src/review/review.schema";
import { ReviewService } from "src/review/review.service";
//import ShortUniqueId from 'short-unique-id';

async function bootstrap() {
    // 
    const app = await NestFactory.createApplicationContext(AppModule);
    // console.log(Reflect.getMetadata('providers', MongooseModule));
    
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name))
    

    const all = reviewModel.find()

    const savePromises = []

    try {
        const result = await reviewModel.updateMany(
            { tags: { $exists: true } }, // Only update documents that have 'tags' field
            { $unset: { tags: 1 } }      // Remove the 'tags' field
        );

        console.log(`Updated ${result.modifiedCount} reviews (removed tags field)`);

        /*
        const reviewsWithTags = await reviewModel.find({ tags: { $exists: true } });

        for (const review of reviewsWithTags) {
            await reviewModel.updateOne(
                { _id: review._id },
                { $unset: { tags: 1 } }
            );
            console.log(`Updated review ${review._id}`);
        }
        */

        // Commented out UUID generation section (for reference)
        /*
        const reviewsToUpdate = await reviewModel.find({ shortid: { $exists: false } });
        const savePromises = [];

        for (const iterator of reviewsToUpdate) {
            // generate uuid
            const rand = new ShortUniqueId();
            const a = rand().toString().toLowerCase();
            const prefix = 'DOME-';
            const c = prefix + a;
            console.log(c);

            // Use updateOne instead of direct assignment + save
            const updatePromise = reviewModel.updateOne(
                { _id: iterator._id },
                { $set: { shortid: a } }
            );
            savePromises.push(updatePromise);
        }

        await Promise.all(savePromises);
        */

        const doc = await reviewModel.findOne();
        console.log('Sample doc after migration:', doc);

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap()