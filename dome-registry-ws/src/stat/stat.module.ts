import { Module } from '@nestjs/common';
import { StatController } from './stat.controller';
import { StatService } from './stat.service';
import { MongooseModule } from "@nestjs/mongoose";
import { Review, ReviewSchema } from "../review/review.schema";

/**
 * StatModule provides functionality for retrieving statistical data about reviews.
 * It includes endpoints for getting annotation counts, journal statistics, and various score metrics.
 */
@Module({
    imports: [
        MongooseModule.forFeature([{ name: Review.name, schema: ReviewSchema }]),
    ],
    controllers: [StatController],
    providers: [StatService],
    exports: [StatService],
})
export class StatModule {}
