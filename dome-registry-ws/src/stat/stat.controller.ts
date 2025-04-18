import { Controller, Get } from "@nestjs/common";
import { StatService } from "./stat.service";
import { ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

/**
 * Controller for retrieving statistical data about reviews.
 * Provides endpoints for getting annotation counts, journal statistics, and various score metrics.
 */
@ApiTags("Stats")
@Controller("stat")
export class StatController {
    /**
     * Creates an instance of StatController.
     * @param statService - The injected StatService
     */
    constructor(
        private readonly statService: StatService,
    ) {}

    /**
     * Get annotation count grouped by year
     * @returns Count of annotations per year
     */
    @ApiOperation({ summary: 'Get annotations count by year' })
    @ApiResponse({ status: 200, description: 'Returns annotations count grouped by year' })
    @Get("totalAnnotationsYear")
    async totalAnnotationsYear() {
        return this.statService.getAnnotationsC();
    }

    /**
     * Get journal names with their annotation counts
     * @returns List of journal names with counts
     */
    @ApiOperation({ summary: 'Get journal names with counts' })
    @ApiResponse({ status: 200, description: 'Returns journal names grouped by count' })
    @Get("totalJournalNames")
    async totalJournalNames() {
        return this.statService.getJournalsName();
    }

    /**
     * Helper method to create score-related endpoint handlers
     * @param serviceMethod - The service method to call
     * @returns Score statistics for the specified category
     * @private
     */
    private getScoreStats(serviceMethod: () => Promise<any[]>): Promise<any[]> {
        return serviceMethod();
    }

    /**
     * Get dataset score statistics
     * @returns Dataset scores with counts
     */
    @ApiOperation({ summary: 'Get dataset score statistics' })
    @ApiResponse({ status: 200, description: 'Returns dataset scores grouped by count' })
    @Get("totalScoreDataset")
    async totalScoreDataset() {
        return this.getScoreStats(() => this.statService.getScoreDataset());
    }

    /**
     * Get optimization score statistics
     * @returns Optimization scores with counts
     */
    @ApiOperation({ summary: 'Get optimization score statistics' })
    @ApiResponse({ status: 200, description: 'Returns optimization scores grouped by count' })
    @Get("totalScoreOptimization")
    async totalScoreOptimization() {
        return this.getScoreStats(() => this.statService.getScoreOptimization());
    }

    /**
     * Get evaluation score statistics
     * @returns Evaluation scores with counts
     */
    @ApiOperation({ summary: 'Get evaluation score statistics' })
    @ApiResponse({ status: 200, description: 'Returns evaluation scores grouped by count' })
    @Get("totalScoreEvaluation")
    async totalScoreEvaluation() {
        return this.getScoreStats(() => this.statService.getScoreEvaluation());
    }

    /**
     * Get model score statistics
     * @returns Model scores with counts
     */
    @ApiOperation({ summary: 'Get model score statistics' })
    @ApiResponse({ status: 200, description: 'Returns model scores grouped by count' })
    @Get("totalScoreModel")
    async totalScoreModel() {
        return this.getScoreStats(() => this.statService.getScoreModel());
    }

    /**
     * Get overall score statistics
     * @returns Overall scores with counts
     */
    @ApiOperation({ summary: 'Get overall score statistics' })
    @ApiResponse({ status: 200, description: 'Returns overall scores grouped by count' })
    @Get("totalScoreOverall")
    async totalScoreOverall() {
        return this.getScoreStats(() => this.statService.getScoreOverall());
    }
}
