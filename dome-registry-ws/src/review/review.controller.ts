import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  UseInterceptors,
  ForbiddenException,
  NotFoundException,
  Query,
  Logger,
  Res,
  ValidationPipe,
  InternalServerErrorException,
} from "@nestjs/common";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/create-review.dto";
import { UpdateReviewDto } from "./dto/update-review.dto";
import { ListReviewsDto } from "./dto/list-reviews.dto";
import { JwtAuthGuard } from "../jwt-auth/jwt-auth.guard";
import { UserInterceptor } from "../user/user.interceptor";
import { UserService } from "../user/user.service";
import { User } from "../user/user.decorator";
import { v4 as UUID } from "uuid";
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Review } from "./review.schema";
import { computeDomeScore } from "dome-registry-core";
import mongodb from "mongodb";
import { ReviewSubmission, SubmitWizards } from "./dto/submit-wizard.dto";
import { Role } from "src/roles/role.enum";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { log, time } from "console";
import { WizardsCreatedEvent } from "src/apicuron-sub/events";
import { Response, response } from "express";

@ApiTags("Reviews")
@Controller("review")
@UseInterceptors(UserInterceptor) // Add non-blocking user retrieval pipeline
export class ReviewController {
  // Dependency injection
  constructor(
    private readonly reviewService: ReviewService,
    private readonly userService: UserService,
    private evenEmitter: EventEmitter2
  ) { }

  logger = new Logger(ReviewController.name);


  @Patch(":shortid")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Get updated review " })
  async update( @Param("shortid") shortid: string,@Body() updateReviewDto: UpdateReviewDto
  ) {
    try {
      let review = await this.reviewService.update(
        Object.assign(updateReviewDto, { shortid })
      );
      if (!review) {
        throw new NotFoundException();
      }
      return review;
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException('An unexpected error occurred');
    }
  }

















  //**----------Get All reviews-------- **/
  @Get()
  @ApiOperation({ summary: "Get all reviews  " })
  async findAll(@Query() query: ListReviewsDto, @User() user) {
    // Define search parameters
    let _query = {
      text: query.text.replace(/[ ]+/, " "),
      public: query.public,
      skip: query.skip,
      limit: query.limit,
      
    };
    // Define sort parameters
    let _sort = { by: query.sort, asc: query.asc };
    // Run query against the database
    return this.reviewService.findAll(_query, _sort, user);
  }

  //**--------------- Get the number of entries in the database-----------  *//
  @ApiOperation({ summary: "Get the total number of Public entries" })
  @ApiResponse({
    status: 200,
    description: "we got it ",
  })
  @Get("total")
  async getPublicEntries() {
    const totalEntries = await this.reviewService.countPub();
    return totalEntries;
  }

  /**********------Get  APICURON  Activities------------***/

  @Get("journal")
  async getJournalCount() {
    const jounalsList = await this.reviewService.APICuronAll();
    return jounalsList;
  }

  /* ------------Swich annotations from private to public---------------- */

  @Patch("publish/:uuid")
  async publishAnnotation(@Param("uuid") uuid: string, @User() user) {
    return await this.reviewService.makePublic(uuid, user);
  }

  /* ---------------Get the number of the private entries in the database ---------- */

  @ApiOperation({
    summary: "Get the total number of the entries in progress (private)",
  })
  @ApiResponse({
    status: 200,
    description: "Success ",
  })
  @Get("totalprivate")
  async getTotalPrivEntries() {
    const totalEntries = await this.reviewService.countprivate();
    return totalEntries;
  }

  //**-- Get the total number  of the entries  ---------/
  @Get("totalpub")
  async getTotalPub() {
    const total = await this.reviewService.contAll();
    return total;
  }

  //get journal counts in the database  //
  @Get("totaljournal")
  async totaljoournal() {
    const total = await this.reviewService.getJournalsC();
    return total;
  }
  
  //**---------------Get Review by Unique shortid UID ------------**/
  @Get(":shortid")
  @ApiOperation({ summary: "Find one review" })
  @ApiResponse({
    status: 403,
    description: "Forbidden",
  })
  @ApiResponse({
    status: 404,
    description: "Data not found",
  })
  @ApiResponse({
    status: 200,
    description: "Review",
  })
  async findOne(@Param("shortid") shortid: string, @User() user) {
    // Try retrieving review
    let review = await this.reviewService.findOneShortid(shortid);
    // Case review is found
    if (review) {
      // Compare user identifier with current use, if review is not public
      // if (review.public || (user && review.user.toString() === user._id)) {
      //   // Return review
      //   return review;
      // }
      // if (!review.public && user.roles === Role.Admin) {
      //   return review;
      // }
      if (review.public) {
        return review;
      }
      if (!review.public) {
        if (user.roles == Role.Admin) {
          return review;
        } else {
          if (user && review.user.toString() == user._id) {
            return review;
          }
        }
      }

      // Otherwise, return 403 Forbidden
      throw new ForbiddenException();
    }
    // Otherwise, return 404 Not Found
    throw new NotFoundException(null, "Not found");
  }

  // Insert a new review in the database
  @Post()
  @ApiOperation({ summary: "Insert new review in the database " })
  @ApiBody({
    type: CreateReviewDto,
  })
  @ApiResponse({
    status: 201,
    description: "Success review updated ",
  })
  @UseGuards(JwtAuthGuard)
  async create(@Body() createReviewDto: CreateReviewDto, @User() user) {
    return this.reviewService.create(createReviewDto, user);
  }

  // **------- Update a revieww -------**//
 

  //**---------Delete A review-------**/
  @Delete(":uuid")
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: "Delete review" })
  @ApiResponse({
    status: 200,
    description: "Review removed successfuly",
  })
  async remove(@Param("uuid") uuid: string, @User() user) {
    return await this.reviewService.remove(uuid,user);
  }

  //*------------------Create a review threw Dome  Wizards ----------------------**//

  // @ApiOperation({ summary: 'Get a  review from wizards' })
  // @ApiResponse({
  //     status: 200,
  //     description: 'we got it ',
  // })
  @Post("wizards")
  async createRevieWizads(
    @Body() wizards: ReviewSubmission,
    @Res() response: Response
  ) {
    this.logger.log("Create Review Wizards");
    console.log(wizards);

    if (!wizards || !wizards.ReviewUser) {
      return response.status(400).json({ message: "Invalid request body" });
    }

    // Mapping the object coming from the Data Stewardship wizards
    const {
      ReviewUser: { user, review },
    } = wizards;

    // insert the ORCID user in the database

    const createdUser = await this.userService.upsertByOrcid(user);

    this.logger.log(
      `Upserted User name: ${createdUser.name}/ orcid ID: ${createdUser.orcid}`
    );

    // Create the review in the Database
    const { callback } = await this.reviewService.create(review, createdUser);

    response.send();
    
    callback();
    
    
  //  this.logger.log(ApicuronData), this.logger.log(`Created Review:`);
    //this.logger.log({ reviewCreated });
  }
}
