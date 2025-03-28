import { NestApplication, NestApplicationContext, NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import { AppModule } from "../app.module";
import { Review, ReviewDocument } from "../review/review.schema";
import { computeDomeScore } from "dome-registry-core"
import { Model } from "mongoose";
async function bootstrap() {


    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: Model<ReviewDocument> = app.get(getModelToken(Review.name));
     
    
    
    await reviewModel.updateMany(
        {}, // Match all documents
        [
          {
            $set: {
              score: {
                $add: [
                  "$dataset.done",
                  "$model.done",
                  "$optimization.done",
                  "$evaluation.done"
                ]
              }
            }
          }
        ]
      );
      

    
 
 
 
 
 
    await app.close();


}


bootstrap();