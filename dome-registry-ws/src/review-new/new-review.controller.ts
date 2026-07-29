import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  InternalServerErrorException,
  Logger,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ReviewNewService } from './new-review.service';
import { CreateReviewNewDto } from './dto/create-review-new.dto';
import { UpdateReviewNewDto } from './dto/update-review-new.dto';
import { ListReviewsNewDto } from './dto/list-reviews-new.dto';
import { JwtAuthGuard } from '../jwt-auth/jwt-auth.guard';
import { UserInterceptor } from '../user/user.interceptor';
import { UserService } from '../user/user.service';
import { User } from '../user/user.decorator';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ReviewSubmissionNew } from './dto/submit-wizard-new.dto';
import { Role } from 'src/roles/role.enum';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Response } from 'express';
import { Types } from 'mongoose';

@ApiTags('Reviews New')
@Controller('review-new')
@UseInterceptors(UserInterceptor)
export class ReviewNewController {
  constructor(
    private readonly reviewNewService: ReviewNewService,
    private readonly userService: UserService,
    private evenEmitter: EventEmitter2
  ) {}

  logger = new Logger(ReviewNewController.name);

  @Patch(':shortid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: ' update review ' })
  async update(
    @Param('shortid') shortid: string,
    @Body() updateReviewDto: UpdateReviewNewDto
  ) {
    try {
      let review = await this.reviewNewService.update(
        Object.assign(updateReviewDto, { shortid }) as any
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
  @ApiOperation({ summary: 'Get all reviews  ' })
  async findAll(@Query() query: ListReviewsNewDto, @User() user) {
    // Define search parameters
    let _query = {
      text: query.text.replace(/[ ]+/, ' '),
      public: query.public,
      skip: query.skip,
      limit: query.limit,
      filter: query.filter,
      isAiGenerated: query.isAiGenerated,
    };
    // Define sort parameters
    let _sort = { by: query.sort, asc: query.asc };
    // Run query against the database
    return this.reviewNewService.findAll(_query, _sort, user);
  }

  //**--------------- Get the number of entries in the database-----------  *//
  @ApiOperation({ summary: 'Get the total number of Public entries' })
  @ApiResponse({
    status: 200,
    description: 'we got it ',
  })
  @Get('total')
  async getPublicEntries() {
    return await this.reviewNewService.countPub();
  }

  /**********------Get  APICURON  Activities------------***/

  @Get('journal')
  async getJournalCount() {
    return await this.reviewNewService.APICuronAll();
  }

  /* ------------Swich annotations from private to public---------------- */

  @Patch('publish/:uuid')
  async publishAnnotation(@Param('uuid') uuid: string, @User() user) {
    return await this.reviewNewService.makePublic(uuid, user);
  }

  /* ---------------Get the number of the private entries in the database ---------- */

  @ApiOperation({
    summary: 'Get the total number of the entries in progress (private)',
  })
  @ApiResponse({
    status: 200,
    description: 'Success ',
  })
  @Get('totalprivate')
  async getTotalPrivEntries() {
    return await this.reviewNewService.countPrivate();
  }

  //**-- Get the total number  of the entries  ---------/
  @Get('totalpub')
  async getTotalPub() {
    return await this.reviewNewService.countAll();
  }

  @Get('latest')
  async getLatestReviews() {
    const latestReviews = await this.reviewNewService.fetchTenLatestReviews();
    if (!latestReviews || latestReviews.length === 0) {
      throw new NotFoundException('No reviews found');
    }
    return latestReviews;
  }

  //**---------------Get Review by Unique shortid UID ------------**/
  @Get(':shortid')
  @ApiOperation({ summary: 'Find one review' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Data not found',
  })
  @ApiResponse({
    status: 200,
    description: 'Review',
  })
  async findOne(@Param('shortid') shortid: string, @User() user) {
    // Try retrieving review
    let review = await this.reviewNewService.findOneShortid(shortid);
    // Case review is found
    if (review) {
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
    throw new NotFoundException(null, 'Not found');
  }

  //**----------Get Review by pmid  ------------------**/
  @Get('pmid/:pmid')
  @ApiOperation({ summary: 'Find review by pmid' })
  @ApiResponse({
    status: 403,
    description: 'Forbidden',
  })
  @ApiResponse({
    status: 404,
    description: 'Data not found',
  })
  @ApiResponse({
    status: 200,
    description: 'Review',
  })
  async findOneByPmid(@Param('pmid') pmid: string) {
    // Try retrieving review
    let review = await this.reviewNewService.findOnePmid(pmid);
    // Case review is found
    if (review) {
      if (review.public) {
        return review;
      } else {
        throw new ForbiddenException();
      }
    }}


  

 // @UseGuards(JwtAuthGuard)
async create(
  @Body() createReviewDto: CreateReviewNewDto,
  @User() user: any
) {
  // 1. Assign the default mock data inside the body
  const currentUser = user || {
    _id: new Types.ObjectId('648c696c92c76639b8bb57cb'),
    orcid: '0009-0000-4401-6504',
    __v: 0,
    name: 'omar mailinator',
    roles: 'admin',
    organisation: 'academia',
    organizations: ['academia', 'GigaScience', 'GigaByte', 'bioRxiv'],
    email: 'attafighani@gmail.com'
  };

  // 2. Pass the local variable to your service
  return this.reviewNewService.create(createReviewDto as any, currentUser);
}

  //**---------Delete A review-------**/
  @Delete(':uuid')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Delete review' })
  @ApiResponse({
    status: 200,
    description: 'Review removed successfuly',
  })
  async remove(@Param('uuid') uuid: string, @User() user) {
    return await this.reviewNewService.remove(uuid, user);
  }

  //*------------------Create a review threw Dome  Wizards ----------------------**//

  @Post('wizards')
  async createRevieWizads(
    @Body() wizards: ReviewSubmissionNew,
    @Res() response: Response
  ) {
    this.logger.log('Create Review Wizards');
    console.log(wizards);

    if (!wizards || !wizards.ReviewUser) {
      return response.status(400).json({ message: 'Invalid request body' });
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
    const { callback } = await this.reviewNewService.create(review as any, createdUser);

    response.send();

    callback();
  }
}
