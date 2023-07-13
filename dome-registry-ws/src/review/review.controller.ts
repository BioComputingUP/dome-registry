import {Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, ForbiddenException, NotFoundException, Query} from "@nestjs/common";
import {ReviewService} from './review.service';
import {CreateReviewDto} from './dto/create-review.dto';
import {UpdateReviewDto} from './dto/update-review.dto';
import {ListReviewsDto} from "./dto/list-reviews.dto";
import {JwtAuthGuard} from "../jwt-auth/jwt-auth.guard";
import {UserInterceptor} from "../user/user.interceptor";
import {UserService} from "../user/user.service";
import {User} from "../user/user.decorator";


@Controller('review')
@UseInterceptors(UserInterceptor)  // Add non-blocking user retrieval pipeline
export class ReviewController {

    // Dependency injection
    constructor(
        private readonly reviewService: ReviewService,
        private readonly userService: UserService,
    ) {}

    @Get()
    async findAll(@Query() query: ListReviewsDto, @User() user) {
        // Define search parameters
        let _query = {
            text: query.text.replace(/[ ]+/, ' '),
            public: query.public,
            skip: query.skip,
            limit: query.limit,
        }
        // Define sort parameters
        let _sort = { by: query.sort, asc: query.asc };
        // Run query against the database
        return this.reviewService.findAll(_query, _sort, user);
    }

    @Get(':uuid')
    async findOne(@Param('uuid') uuid: string, @User() user) {
        // Try retrieving review
        let review = await this.reviewService.findOne(uuid);
        // Case review is found
        if (review) {
            // Compare user identifier with current use, if review is not public
            if (review.public || (user && review.user.toString() === user._id)) {
                // Return review
                return review;
            }
            // Otherwise, return 403 Forbidden
            throw new ForbiddenException();
        }
        // Otherwise, return 404 Not Found
        throw new NotFoundException();
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async create(@Body() createReviewDto: CreateReviewDto, @User() user) {
        // Insert a new review in the database
        return this.reviewService.create(createReviewDto, user);
    }

    @Patch(':uuid')
    @UseGuards(JwtAuthGuard)
    async update(@Param('uuid') uuid: string, @Body() updateReviewDto: UpdateReviewDto, @User() user) {
        // Get updated review, if any
        let review = await this.reviewService.update(Object.assign(updateReviewDto, {uuid}), user);
        // Case no review was returned
        if (!review) {
            // Then, return 404 Not Found
            throw new NotFoundException();
        }
        // Otherwise, return review
        return review;
    }

    @Delete(':uuid')
    @UseGuards(JwtAuthGuard)
    async remove(@Param('uuid') uuid: string, @User() user) {
        return this.reviewService.remove(uuid, user);
    }

}
