import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import ShortUniqueId from "short-unique-id";
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
   
    const customDictionary = [
        '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
        'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'
       ];
    //const dictionnary = '0123456789abcdefghijklmnopqrstuvwxyz';
   //  const uid = new ShortUniqueId({dictionary: customDictionary});

    const all = reviewModel.find()

    // await reviewModel.updateMany({}, { $unset: { new_uid: 1 }});
    const savePromises = []
    const query = {
            
        created: {
          $type: 'number'
        },
        updated:{
            $type:'number'
        }
    };
     for await (const iterator of all) {
      
                
                 

        
    //     // generate uuid
        // const rev = await reviewModel.findOne(iterator.id);

        // const newCreated = new Date(iterator.created);
        // const newUpdated = new Date(iterator.updated)
        
        // await reviewModel.findOneAndUpdate(query,{$set:{"created":newCreated}});
        // await reviewModel.findOneAndUpdate(query,{$set:{"updated":newUpdated}});



        // await reviewModel.findByIdAndUpdate(iterator._id,{$set:{"shortid":uid.randomUUID(10)}});

        // iterator.created = newCreated.getTime()
        // iterator.updated = newUpdated;

        iterator.markModified('created');
        iterator.markModified('updated');
    
        
        const savePromise = iterator.save();
         savePromises.push(savePromise);
     }


    await Promise.all(savePromises)
    /* 
    const doc = await reviewModel.findOne()
    console.log('doc', doc)
 */
    await app.close();
}

bootstrap()