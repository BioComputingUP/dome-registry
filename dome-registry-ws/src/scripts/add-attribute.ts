import {NestFactory} from "@nestjs/core"
import {MongooseModule, getModelToken} from "@nestjs/mongoose";
import mongoose from "mongoose";
import {AppModule} from "src/app.module"
import {Review, ReviewDocument} from "src/review/review.schema";
import * as fs from "fs";

// NODE_ENV= Developement node script.js


async function bootstrap() {
   
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        // Read updates from pcidpmid.json
        const updatesRaw = fs.readFileSync("/home/omar/Domebiocomp/dome-registry/dome-registry-ws/src/scripts/pcidpmid.json", "utf8");
        const updates = JSON.parse(updatesRaw);

        let updatedCount = 0;
        const domeIdArray: string[] = [];
        const duplicateDomeIds: string[] = [];
        const domeIdSet = new Set<string>();
        for (const update of updates) {
            const domeId = update.domeshort_id;
            const pmcid = update.PMCID;
            const pmid = String(update.PMID);
            console.log(`Processing domeId: ${domeId}, PMCID: ${pmcid}, PMID: ${pmid}`);
            domeIdArray.push(domeId);
            if (domeIdSet.has(domeId)) {
                duplicateDomeIds.push(domeId);
            } else {
                domeIdSet.add(domeId);
            }
            // Find the review by domeId
            const review = await reviewModel.findOne({ shortid: domeId });
            if (review) {
                // Set values directly and mark as modified
                review.publication.pmcid = pmcid;
                review.publication.pmid = pmid;
        
                review.markModified('publication.pmcid');
                review.markModified('publication.pmid');
                
                await review.save();
                updatedCount++;
            }
        }
        console.log(`Updated ${updatedCount} documents with pmcid and pmid from updates.json`);
        if (duplicateDomeIds.length > 0) {
            console.log("Duplicate domeIds found:", duplicateDomeIds);
        } else {
            console.log("No duplicate domeIds found.");
        }
    } catch (error) {
        console.error('Error updating documents:', error);
    } finally {
        await app.close();
    }


  
}

bootstrap()