import { NestFactory } from "@nestjs/core";
import { getModelToken } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "src/app.module";
import { Review, ReviewDocument } from "src/review/review.schema";

async function bootstrap() {
    const fieldsToRemove = process.argv.slice(2);
    const env = process.env.NODE_ENV || 'development';

    if (fieldsToRemove.length === 0) {
        console.error('No fields specified. Usage: node dist/scripts/remove-attribute.js tags reviewState');
        process.exit(1);
    }

    console.log(`Starting database migration in '${env}' environment...`);
    console.log(`Removing fields [${fieldsToRemove.join(', ')}] from review documents.`);

    const app = await NestFactory.createApplicationContext(AppModule);
    const configService = app.get(ConfigService);
    const mongoConfig = configService.get<{host: string; port: number; user: string; secret: string; name: string}>('mongo');
    const auth = mongoConfig?.user && mongoConfig?.secret ? `${mongoConfig.user}:${mongoConfig.secret}@` : '';
    const uri = `mongodb://${auth}${mongoConfig?.host}:${mongoConfig?.port}/${mongoConfig?.name}`;

    console.log(`Loaded Mongo DB URI: ${uri}`);

    const reviewModel: mongoose.Model<ReviewDocument> = app.get(getModelToken(Review.name));

    const unsetObject = fieldsToRemove.reduce((acc, field) => {
        acc[field] = 1;
        return acc;
    }, {} as Record<string, number>);

    try {
        // Use the raw Mongo collection to avoid Mongoose update behavior with reserved names.
        const result = await reviewModel.collection.updateMany({}, { $unset: unsetObject });

        console.log('Migration completed successfully.');
        console.log(`  fields removed: ${fieldsToRemove.join(', ')}`);
        console.log(`  matched: ${result.matchedCount}`);
        console.log(`  modified: ${result.modifiedCount}`);

        for (const field of fieldsToRemove) {
            const remaining = await reviewModel.collection.countDocuments({ [field]: { $exists: true } });
            console.log(`  remaining documents with '${field}': ${remaining}`);
        }
    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();