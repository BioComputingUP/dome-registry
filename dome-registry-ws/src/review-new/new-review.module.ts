import {Module} from '@nestjs/common';

import { ReviewNewService } from './new-review.service';

import { ReviewNewController } from './new-review.controller';
import {MongooseModule} from "@nestjs/mongoose";

import { ReviewNewSchema, ReviewNewDocument, ReviewNewModel } from './new-review.schema';

import {User, UserSchema} from "../user/user.schema";
import {UserModule} from "../user/user.module";
import {JwtService} from "@nestjs/jwt";
import { DataCatalogController } from '../review/Json-ld/json-ld.controller';
import { JsonLdService } from '../review/Json-ld/json-ld.service';

@Module({

    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema}]),
        
        MongooseModule.forFeature([{name: ReviewNewModel.name, schema: ReviewNewSchema}]),
        UserModule,
    ],
    exports: [MongooseModule],
    controllers: [ReviewNewController],
    providers: [ReviewNewService, JwtService]
})
export class newReviewModule {
}