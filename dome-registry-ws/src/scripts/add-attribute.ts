import { NestFactory } from "@nestjs/core"
import { MongooseModule, getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
//import { ReviewModule } from "src/review/review.module";
//import { Review, ReviewDocument } from "src/review/review.schema";
import { User, UserDocument } from "src/user/user.schema";
//import { ReviewService } from "src/review/review.service";
import { Role } from "src/roles/role.enum";


async function bootstrap() {
    // 
    const app = await NestFactory.createApplicationContext(AppModule);
    // console.log(Reflect.getMetadata('providers', MongooseModule));

    const userModel: mongoose.Model<UserDocument> = app.get(getModelToken(User.name))


    await userModel.updateMany({}, { $set: { "organisation": "undefined" } });
    

    // const all = userModel.find();
    // all.updateMany({}, { $set: { roles: Role.User } });


    // const savePromises = [];
    // for await (const iterator of all) {
    //     //     // generate uuid
    //     await userModel.findByIdAndUpdate(iterator._id, { $set: { roles: Role.User } });

    //     const savePromise = iterator.save();
    //     savePromises.push(savePromise);
    // }



    // await Promise.all(savePromises);
    // const doc = await userModel.findOne();
    // console.log('doc', doc);
    /* 
    const doc = await reviewModel.findOne()
    console.log('doc', doc)
 */
    await app.close();
}

bootstrap()