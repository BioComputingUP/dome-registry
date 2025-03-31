import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
//import { ReviewModule } from "src/review/review.module";
//import { Review, ReviewDocument } from "src/review/review.schema";
import { User, UserDocument } from "src/user/user.schema";
//import { ReviewService } from "src/review/review.service";
import { Role } from "src/roles/role.enum";
import { Review, ReviewDocument } from "src/review/review.schema";
// NODE_ENV= Developement node script.js


async function bootstrap() {
 
    const app = await NestFactory.createApplicationContext(AppModule);


    const userModel: mongoose.Model<UserDocument> = app.get(getModelToken(User.name));

  

    
    
  
    await userModel.updateOne(
        { orcid: '' }, // Filter by Orcid.
        {
          $addToSet: {
            organizations: {
              $each: [''], // Add multiple values
            },
          },
        },
      );






    await app.close();
}
bootstrap()