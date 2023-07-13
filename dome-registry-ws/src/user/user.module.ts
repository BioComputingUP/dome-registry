import {Module} from '@nestjs/common';
import {MongooseModule} from "@nestjs/mongoose";
import {User, UserSchema} from "./user.schema";
import {UserController} from './user.controller';
import {UserService} from './user.service';
import {JwtService} from "@nestjs/jwt";


@Module({
    imports: [
        MongooseModule.forFeature([{name: User.name, schema: UserSchema,}]),
    ],
    controllers: [UserController],
    providers: [UserService, JwtService],
    exports: [UserService],
})
export class UserModule {
}
