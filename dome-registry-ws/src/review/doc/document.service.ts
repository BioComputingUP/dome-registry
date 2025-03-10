import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import {
  Types,
  Model,
  Query,
  QueryOptions,
  mongo,
  FilterQuery,
} from "mongoose";
import { v4 as UUID } from "uuid";
import { Review, ReviewDocument } from "../review.schema";
import { User, UserDocument } from "src/user/user.schema";
import { computeDomeScore } from "dome-registry-core";
import { Role } from "src/roles/role.enum";
import ShortUniqueId from "short-unique-id";
import { timestamp } from "rxjs";
import { ClientService } from "src/apicuron-sub/apicuron-client.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UserModule } from "src/user/user.module";
import { title } from "process";
import { CaslAbilityFactory } from "src/casl/casl-ability.factory";
import { Action } from "src/Actions/action.enum";
import { IsIn } from "class-validator";
import { GetReviewsDto } from "../dto/get-review-dto";
import { filterFields } from "../dto/get-review-dto";
import { accessibleBy } from "@casl/mongoose";
import { escapeRegex } from "src/casl/utils/regex.utils";




function buildQuery(getReviewDto: GetReviewsDto): FilterQuery<ReviewDocument> {
  const filterField = filterFields[getReviewDto.field];
  const query: FilterQuery<ReviewDocument> = {
    [filterField]: { $regex: getReviewDto.text, $options: "i" },
  };
  return query;
}

@Injectable()
export class DocumentService {
  private uid: ShortUniqueId;
  // abilityFactory: any;
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private eventEmmitter: EventEmitter2,
    private abilityFactory: CaslAbilityFactory
  ) {
    const customDictionary = [
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
    ];
  }
  //sort the reviews

  async findAll(getReviewsDto: GetReviewsDto, user?: User) {

    const ability = this.abilityFactory.createForUser(user);
    const caslQuery = accessibleBy(ability).ofType(this.reviewModel);
    const filter: any = {$and: [caslQuery]};
    const pipeline = [];

    /// the Opertations to get the data for the database
    //const query = buildQuery(getReview);
     if(getReviewsDto.field && getReviewsDto.text){
     const dbField = getReviewsDto.field ?
        filterFields[getReviewsDto.field] : filterFields.title;
      
        const searchPattern = escapeRegex(getReviewsDto.text);


     pipeline.push({[dbField]: {$regex: searchPattern, $options: "i"}});   
    
    }
    pipeline.push({$text: {$search: getReviewsDto.field}});

     pipeline.push({$sort: { [getReviewsDto.sort]: getReviewsDto.asc ? 1 : -1 }});

     pipeline.push({
      $project: {
   _id:0,
    title: "$publication.title",
    authors: "$publication.authors",
    journal: "$publication.journal",
    year: "$publication.year",
    tags: "$publication.tags",
    shortid: "$shortid",
    created: "$created",
    updated: "$updated",

      }
     });

     pipeline.push({$limit: getReviewsDto.limit});
      pipeline.push({$skip: getReviewsDto.skip});

    const data = await this.reviewModel.aggregate(pipeline).exec();

    return data;  
  }
}
