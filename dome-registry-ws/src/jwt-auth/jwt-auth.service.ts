import {Injectable} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import {User} from "../user/user.schema";

@Injectable()
export class JwtAuthService {

    // Constructor
    constructor(private jwtService: JwtService) {
    }

    // Log user in (a valid access token is issued)
    login(user: User) {
        // Get expected payload
        const payload: any = {_id: user._id, orcid: user.orcid};
        // Return signed access token
        return {accessToken: this.jwtService.sign(payload)};
    }

}
