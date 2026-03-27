import { NestFactory } from "@nestjs/core"
import { getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
import { Review, ReviewDocument } from "src/review/review.schema";

/**
 * Utility script to check the type of publication.pmid field in the database
 * 
 * Usage:
 *   NODE_ENV=development node dist/scripts/check-pmid-type.js
 * 
 * This script will:
 * 1. Connect to MongoDB through NestJS
 * 2. Check the data types of publication.pmid across all documents
 * 3. Report findings
 */

async function bootstrap() {
    console.log(' Checking publication.pmid field types in database...\n');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        // Use aggregation pipeline to check field types
        const typeResults = await reviewModel.aggregate([
            {
                $group: {
                    _id: {
                        $type: "$publication.pmid"
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        console.log(' Field Type Summary:');
        console.log(' ─────────────────────────────');
        
        if (typeResults.length === 0) {
            console.log(' No documents found.');
            await app.close();
            return;
        }

        typeResults.forEach((result) => {
            console.log(`   ${result._id || 'missing'}: ${result.count} document(s)`);
        });

        console.log(' ─────────────────────────────\n');

        // Get a sample document from each type
        for (const typeResult of typeResults) {
            const sample = await reviewModel.findOne().exec();
            if (sample && sample.publication?.pmid !== undefined) {
                console.log(` Sample pmid value: "${sample.publication.pmid}"`);
                console.log(` Actual type: ${typeof sample.publication.pmid}`);
                break;
            }
        }

    } catch (error) {
        console.error(' Error during check:', error);
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
