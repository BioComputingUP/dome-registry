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

    //const reviewModel : mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    
    
     //await userModel.updateMany({$exists:false}, { $set: { organizations: ['academia'] } } );
    //await userModel.updateMany({}, { $set: { "organizations": "undefined" } });
    await userModel.findOneAndUpdate({orcid:'0009-0002-2327-9430'},{$addToSet: {organizations:'bioRxiv'}});

    await app.close();
}
bootstrap()