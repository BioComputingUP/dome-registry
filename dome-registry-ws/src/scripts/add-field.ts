import { NestFactory } from "@nestjs/core"
import { getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { AppModule } from "src/app.module"
import { Review, ReviewDocument } from "src/review/review.schema";

/**
 * Database migration script to add pmcid field to publication object in review collection
 * Database migration script to add isAiGenerated field to review collection
 * 
 * Usage:
 *   NODE_ENV=development node dist/scripts/add-field.js
 * 
 * This script will:
 * 1. Connect to MongoDB through NestJS
 * 2. Find all review documents aiGenerated field is missing
 * 3. Add an empty pmcid field to those documents
 * 2. Find all review documents where isAiGenerated field is missing
 * 3. Add isAiGenerated field (default: false) to those documents
 */

async function bootstrap() {
    console.log(' Starting database migration: Adding isAiGenerated field to reviews...\n');
    
    const app = await NestFactory.createApplicationContext(AppModule);
    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    try {
        const updateResult = await reviewModel.updateMany(
            { isAiGenerated: { $exists: false } },
            { $set: { isAiGenerated: false } }
        );

        console.log(' Migration completed successfully!');
        console.log(`   • Matched documents: ${updateResult.matchedCount}`);
        console.log(`   • Modified documents: ${updateResult.modifiedCount}`);
    } catch (error) {
        console.error(' Error during migration:', error);
    } finally {
        await app.close();
    }
}

bootstrap();