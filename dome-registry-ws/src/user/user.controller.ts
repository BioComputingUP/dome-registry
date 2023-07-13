import {Controller, Get, UseGuards} from "@nestjs/common";
import {JwtService} from "@nestjs/jwt";
import {JwtAuthGuard} from "../jwt-auth/jwt-auth.guard";
import {UserService} from './user.service';
import {User} from "./user.decorator";


@Controller('user')
export class UserController {

    // Dependency injection
    constructor(
        private readonly jwtService: JwtService,
        private readonly userService: UserService
    ) {}

    @Get()  // Define GET endpoint
    @UseGuards(JwtAuthGuard)  // Protect endpoint with JWT authentication
    async findOne(@User() user) {
        // Check if authorized ORCID identifier (cookie) matches requested one (GET parameter)
        return this.userService.findById(user && user._id);
    }

}
