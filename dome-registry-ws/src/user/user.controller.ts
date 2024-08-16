import { Controller, Get, UseGuards, Param } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { JwtAuthGuard } from "../jwt-auth/jwt-auth.guard";
import { UserService } from './user.service';
import { User } from "./user.decorator";
import { ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ObjectId, isValidObjectId } from "mongoose";
import { UserSchema } from "./user.schema";

@Controller('user')
export class UserController {

    // Dependency injection
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) { }


    
    @Get()  // Define GET endpoint
    @UseGuards(JwtAuthGuard)  // Protect endpoint with JWT authentication
    async findOne(@User() user) {
        // Check if authorized ORCID identifier (cookie) matches requested one (GET parameter)
        return this.userService.findById(user && user._id);
    }
    
    
    
    @Get('owner/:uid')
    async findByObId(@Param('uid') uid: ObjectId) {

         
        let user = await this.userService.findById2(uid);

        return user.orcid;

    }
    
    //**--------------- Get the total number of users -----------  *//
    @Get('total')
    @ApiOperation({ summary: 'Get the total number of Users' })
    @ApiResponse({
        status: 200,
        description: 'we got it ',
    })
    
    async count() {
        const totalEntriees = await this.userService.counUsers();
        return totalEntriees;
    }

// ** --------------------Get the users that do not have OCID ID ---------------------**//

     @Get('orcid')
     async OrcidNO(){
        return this.userService.userNoOrcid();
     }

    @Get('orcidyes')
    async OrcidYes(){
        return this.userService.userOrcid();
    }

     




}