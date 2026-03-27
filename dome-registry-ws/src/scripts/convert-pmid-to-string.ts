import { NestFactory } from "@nestjs/core"
import { getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
import { Review, ReviewDocument } from "src/review/review.schema";

/**
 * Database migration script to convert publication.pmid from number to string
 * 
 * Usage:
 *   NODE_ENV=development node dist/scripts/convert-pmid-to-string.js
 * 
 * This script will:
 * 1. Connect to MongoDB through NestJS
 * 2. Find all review documents where publication.pmid is a number
 * 3. Convert those pmid values to strings
 */

async function bootstrap() {
    console.log(' Starting database migration: Converting publication.pmid from number to string...\n');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        // First, check how many documents have pmid values
        const countWithPmid = await reviewModel.countDocuments({
            "publication.pmid": { $exists: true }
        });

        if (countWithPmid === 0) {
            console.log(' No documents found with publication.pmid field.');
            await app.close();
            return;
        }

        console.log(` Found ${countWithPmid} document(s) with pmid values\n`);

        // Update all documents to convert publication.pmid to string (regardless of current type)
        const updateResult = await reviewModel.updateMany(
            { "publication.pmid": { $exists: true } },  // Find all documents with pmid
            [
                {
                    $set: { 
                        "publication.pmid": { $toString: "$publication.pmid" }  // Convert to string
                    }
                }
            ]
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
