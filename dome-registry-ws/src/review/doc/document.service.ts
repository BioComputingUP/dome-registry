import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Types, Model, Query, QueryOptions, mongo } from "mongoose";
import { v4 as UUID } from "uuid";
import { Review, ReviewDocument } from "../review.schema";
import { User, UserDocument } from "src/user/user.schema";
import { computeDomeScore } from "dome-registry-core";
import { Role } from "src/roles/role.enum";
// import ShortUniqueId from "short-unique-id";
import { timestamp } from "rxjs";
import { ClientService } from "src/apicuron-sub/apicuron-client.service";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { UserModule } from "src/user/user.module";
import { title } from "process";



@Injectable()

export class DocumentService {
 constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
 ){

 }

 async findAll ({user,search,limit = 10,skip = 0,}: {user?: User, search?: string;limit?: number;skip?: number;
  }){
    const query: any= {};
    const searchQuery = [];
    const allowedSearchFields = ['title', 'content',];

    if (search){
        //search functionnality
        searchQuery.push ({title: {$regex : search,$option: 'i'}},
                         { content: { $regex: search, $options: 'i' } }
        );
        query.$or = searchQuery;
    }

  // if (user.is) {}





 }



}