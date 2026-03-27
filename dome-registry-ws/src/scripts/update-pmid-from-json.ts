import { NestFactory } from "@nestjs/core"
import { getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import * as fs from "fs";
import * as path from "path";
import { AppModule } from "src/app.module"
import { Review, ReviewDocument } from "src/review/review.schema";

/**
 * Database migration script to update publication.pmid from JSON data
 * 
 * Usage:
 *   NODE_ENV=development node dist/scripts/update-pmid-from-json.js
 * 
 * This script will:
 * 1. Connect to MongoDB through NestJS
 * 2. Read the output.json file
 * 3. For each entry, find the review by shortid (domeshort_id)
 * 4. Update the publication.pmid with the PMID value from JSON
 */

interface PMIDData {
    domeshort_id: string;
    PMID: string;
    PMCID: string;
}

async function bootstrap() {
    console.log(' Starting database migration: Updating publication.pmid from JSON file...\n');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        // Read the JSON file
        const jsonFilePath = path.join(__dirname, '../scripts/output.json');
        
        if (!fs.existsSync(jsonFilePath)) {
            console.error(` Error: JSON file not found at ${jsonFilePath}`);
            await app.close();
            process.exit(1);
        }

        const jsonData: PMIDData[] = JSON.parse(fs.readFileSync(jsonFilePath, 'utf-8'));
        console.log(` Loaded ${jsonData.length} entries from JSON file\n`);

        let successCount = 0;
        let skipCount = 0;
        let errorCount = 0;

        // Process each entry
        for (const entry of jsonData) {
            try {
                const { domeshort_id, PMID } = entry;

                // Skip entries with empty PMID
                if (!PMID || PMID.trim() === '') {
                    skipCount++;
                    continue;
                }

                // Find review by shortid
                const review = await reviewModel.findOne({ shortid: domeshort_id });

                if (!review) {
                    console.warn(` ⚠ Review not found for shortid: ${domeshort_id}`);
                    errorCount++;
                    continue;
                }

                // Update the pmid (convert to string)
                const pmidString = String(PMID);
                const updateResult = await reviewModel.updateOne(
                    { shortid: domeshort_id },
                    { $set: { "publication.pmid": pmidString } }
                );

                if (updateResult.modifiedCount > 0) {
                    successCount++;
                    console.log(` ✓ Updated ${domeshort_id}: pmid set to "${pmidString}"`);
                }

            } catch (entryError) {
                console.error(` ✗ Error processing entry:`, entryError);
                errorCount++;
            }
        }

        console.log('\n Migration completed!');
        console.log(' ─────────────────────────────');
        console.log(`   • Processed: ${jsonData.length}`);
        console.log(`   • Successfully updated: ${successCount}`);
        console.log(`   • Skipped (empty PMID): ${skipCount}`);
        console.log(`   • Errors: ${errorCount}`);
        console.log(' ─────────────────────────────');

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
