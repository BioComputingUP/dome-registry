import {Module} from '@nestjs/common';
import {ReviewService} from '../review.service';
import {ReviewController} from '../review.controller';

import {MongooseModule} from "@nestjs/mongoose";
import {Review, ReviewDocument, ReviewSchema} from "../review.schema";
import {User, UserSchema} from "src/user/user.schema";
import {UserModule} from "src/user/user.module";
import {JwtService} from "@nestjs/jwt";
import { DocumentController } from './document.contoller';
import { DocumentService } from './document.service';
// import { DataCatalogController } from './Json-ld/json-ld.controller';
// import { JsonLdService } from './Json-ld/json-ld.service';


@Module({
 imports: [
MongooseModule.forFeature([{name:User.name,schema:UserSchema}]),
MongooseModule.forFeature([{name:Review.name,schema:ReviewSchema}]),
UserModule,
 ],   
 controllers:[DocumentController],
 providers: [DocumentService,JwtService]
})

export class DocumentModule {
    



}