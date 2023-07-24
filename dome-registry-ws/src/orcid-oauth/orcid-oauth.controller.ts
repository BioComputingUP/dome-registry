import {Controller, Get, Post, Req, Res, UseGuards} from "@nestjs/common";
import {ConfigService} from "@nestjs/config";
import {JwtAuthService} from "../jwt-auth/jwt-auth.service";
import {OrcidOauthGuard} from "./orcid-oauth.guard";
import { ApiTags, ApiOperation, ApiOAuth2 } from "@nestjs/swagger";


@ApiTags('auth/orcid')
@Controller("auth/orcid")
export class OrcidOauthController {

    // Constructor
    constructor(
        private jwtAuthService: JwtAuthService,
        private configService: ConfigService,
    ) {}

    @Get()
    // NOTE Guards can access low-level features of the request
    @UseGuards(OrcidOauthGuard)
    async orcidAuth(@Req() req) {}

    // NOTE This route should send back to the client with a valid JWT
    @Get("redirect")
    @UseGuards(OrcidOauthGuard)
    async orcidAuthRedirect(@Req() req, @Res({ passthrough: true }) res) {
        // Retrieve JWT after login attempt
        const {accessToken} = this.jwtAuthService.login(req.user);
        // Set cookie in the response
        res.cookie('jwt', accessToken);
        // Redirect to client
        res.redirect(this.configService.get<string>('client.url'));
    }

}
