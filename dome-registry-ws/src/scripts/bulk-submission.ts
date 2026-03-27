import {NestFactory} from "@nestjs/core"
import {MongooseModule, getModelToken} from "@nestjs/mongoose";
import mongoose from "mongoose";
import {AppModule} from "src/app.module"
import {Review, ReviewDocument} from "src/review/review.schema";
import * as fs from "fs";
import { ReviewService } from "src/review/review.service";
import * as path from "path";
import { User, UserDocument } from "src/user/user.schema";

// NODE_ENV= Developement node script.js


async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));
    const userModel:mongoose.Model<UserDocument> = app.get(getModelToken(User.name));


    const orcid = "0009-0002-2327-9430"
    const user = await userModel.findOne({orcid})
    const mySV = await app.get(ReviewService)
   try {
        // Read the JSON file
        const jsonFilePath =  '/home/omar/Domebiocomp/dome-registry/dome-registry-ws/src/scripts/newdata2.json';
        
        if (!fs.existsSync(jsonFilePath)) {
            console.error(` Error: JSON file not found at ${jsonFilePath}`);
            await app.close();
            process.exit(1);
        }

        const jsonData =  JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        console.log(` Loaded ${jsonData.length} entries from JSON file\n`);
        for (const entry of jsonData) {
            try {   
               await  mySV.create({...entry,isAiGenerated:true,public:true},user)
               console.log("upserting the ", entry.publication.title)


            } catch (entryError) {
                console.error(` ✗ Error processing entry:`, entryError);
            }
        }
    console.log(` Loaded ${jsonData.length} entries from JSON file\n`);


    } catch (error) {
        console.error(' Error during migration:', error);
        process.exit(1);
    }finally {
        await app.close();
        console.log('\n Database connection closed.');
    }



}

bootstrap()