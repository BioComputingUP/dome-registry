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
  import { ReviewService } from "../review.service";
  import { CreateReviewDto } from "../dto/create-review.dto";
  import { UpdateReviewDto } from "../dto/update-review.dto";
  import { ListReviewsDto } from "../dto/list-reviews.dto";
  import { JwtAuthGuard } from "src/jwt-auth/jwt-auth.guard"; 
  import { UserInterceptor } from "src/user/user.interceptor";
  import { UserService } from "src/user/user.service";
  import { User } from "src/user/user.decorator";
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
  import { Review } from "../review.schema";
  import { computeDomeScore } from "dome-registry-core";
  import mongodb from "mongodb";
  import { ReviewSubmission, SubmitWizards } from "../dto/submit-wizard.dto";
  import { Role } from "src/roles/role.enum";
  import { EventEmitter2 } from "@nestjs/event-emitter";
  import { log, time } from "console";
  import { WizardsCreatedEvent } from "src/apicuron-sub/events";
  import { Response, response } from "express";
import { DocumentService } from "./document.service";



  @ApiTags('Documents')
  @Controller('documents')
  @UseInterceptors(UserInterceptor)
  export class DocumentController{
    constructor(
      private readonly documentService: DocumentService,
      private readonly userService: UserService,
      private evenEmitter: EventEmitter2){
  }

  
  }