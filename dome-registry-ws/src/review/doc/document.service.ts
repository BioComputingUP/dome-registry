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



@Injectable()

export class DocumentService {





}