import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
import { ReviewModule } from "src/review/review.module";
import { Review, ReviewDocument } from "src/review/review.schema";
import { ReviewService } from "src/review/review.service";


async function bootstrap() {
    // 
    const app = await NestFactory.createApplicationContext(AppModule);
    // console.log(Reflect.getMetadata('providers', MongooseModule));
    
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name))
    

    // const all = reviewModel.find()

    await reviewModel.updateMany({}, { $unset: { new_uid: 1 }});
    //const savePromises = []

    // for await (const iterator of all) {
    //     // generate uuid
    //     await reviewModel.findByIdAndUpdate(iterator._id,{$unset:{new_uid:'' }});

    
    await reviewModel.updateMany({}, { $unset: { scores: "" } }
    );  
    //     const savePromise = iterator.save();
    //     savePromises.push(savePromise);
    // }


    //await Promise.all(savePromises)
    /* 
    const doc = await reviewModel.findOne()
    console.log('doc', doc)
 */
    await app.close();
}

bootstrap()