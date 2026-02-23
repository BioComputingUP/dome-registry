import { NestFactory } from "@nestjs/core"
import { getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
import { Review, ReviewDocument } from "src/review/review.schema";

/**
 * Database migration script to add pmcid field to publication object in review collection
 * 
 * Usage:
 *   NODE_ENV=development node dist/scripts/add-field.js
 * 
 * This script will:
 * 1. Connect to MongoDB through NestJS
 * 2. Find all review documents where publication.pmcid field is missing
 * 3. Add an empty pmcid field to those documents
 */

async function bootstrap() {
    console.log(' Starting database migration: Adding pmcid field to publication...\n');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        // First, check how many documents need updating
        const countMissing = await reviewModel.countDocuments({
            "publication.pmcid": { $exists: false }
        });

        if (countMissing === 0) {
            console.log(' All documents already have pmcid field. No updates needed.');
            await app.close();
            return;
        }

        console.log(` Found ${countMissing} document(s) missing pmcid field\n`);

        // Add pmcid field to publication object for documents that don't have it
        const updateResult = await reviewModel.updateMany(
            { "publication.pmcid": { $exists: false } },  // Find documents without publication.pmcid
            { $set: { "publication.pmcid": "" } }         // Set publication.pmcid to empty string
        );

        console.log(' Migration completed successfully!');
        console.log(`   • Matched documents: ${updateResult.matchedCount}`);
        console.log(`   • Modified documents: ${updateResult.modifiedCount}`);
        console.log(`   • Acknowledged: ${updateResult.acknowledged}`);

    } catch (error) {
        console.error(' Error during migration:', error);
        process.exit(1);
    } finally {
        await app.close();
        console.log('\n Database connection closed.');
    }
}

// Execute the bootstrap function
bootstrap().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});