import { InjectModel } from "@nestjs/mongoose";
import { Review, ReviewDocument } from "../review/review.schema";
import { Model } from "mongoose";
import { Injectable } from "@nestjs/common";

/**
 * Service for retrieving statistical data about reviews.
 * Provides methods for aggregating and analyzing review data.
 */
@Injectable()
export class StatService {
    /**
     * Creates an instance of StatService.
     * @param reviewModel - Injected Mongoose model for Review documents
     */
    constructor(
        @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>
    ) {}

    /**
     * Generic method to aggregate data from reviews.
     * @param groupByField - The field to group by in the aggregation
     * @param sortCriteria - The criteria to sort the results by
     * @returns Aggregated data grouped by the specified field
     * @throws Will throw an error if the aggregation fails
     */
    async aggregateData(groupByField: any, sortCriteria: any): Promise<any[]> {
        try {
            return await this.reviewModel.aggregate([
                { $match: { public: true } },
                {
                    $group: {
                        _id: groupByField,
                        count: { $sum: 1 },
                    },
                },
                { $sort: sortCriteria },
            ]);
        } catch (error) {
            console.error("Error in aggregateData:", error);
            throw error; // Re-throw the error for the caller to handle
        }
    }

    /**
     * Gets annotation counts grouped by publication year.
     * @returns Count of annotations per year
     */
    async getAnnotationsC(): Promise<any[]> {
        return this.aggregateData(
            { $trim: { input: "$publication.year" } }, // Group by trimmed year
            { _id: -1 } // Sort by year in descending order
        );
    }

    /**
     * Gets journal names with their annotation counts.
     * @returns List of journal names with counts
     */
    async getJournalsName(): Promise<any[]> {
        return this.aggregateData(
            "$publication.journal", // Group by journal name
            { count: -1 } // Sort by count in descending order
        );
    }

    /**
     * Gets score statistics for a specific category.
     * @param category - The category to get scores for (dataset, optimization, etc.)
     * @returns Scores with counts for the specified category
     * @private
     */
    private async getScoreByCategory(category: string): Promise<any[]> {
        return this.aggregateData(
            `$${category}.done`, // Group by category score
            { _id: -1 } // Sort by score in descending order
        );
    }

    /**
     * Gets dataset score statistics.
     * @returns Dataset scores with counts
     */
    async getScoreDataset(): Promise<any[]> {
        return this.getScoreByCategory('dataset');
    }

    /**
     * Gets optimization score statistics.
     * @returns Optimization scores with counts
     */
    async getScoreOptimization(): Promise<any[]> {
        return this.getScoreByCategory('optimization');
    }

    /**
     * Gets evaluation score statistics.
     * @returns Evaluation scores with counts
     */
    async getScoreEvaluation(): Promise<any[]> {
        return this.getScoreByCategory('evaluation');
    }

    /**
     * Gets model score statistics.
     * @returns Model scores with counts
     */
    async getScoreModel(): Promise<any[]> {
        return this.getScoreByCategory('model');
    }

    /**
     * Gets overall score statistics.
     * @returns Overall scores with counts
     */
    async getScoreOverall(): Promise<any[]> {
        return this.aggregateData(
            "$score", // Group by overall score
            { _id: -1 } // Sort by score in descending order
        );
    }
}
