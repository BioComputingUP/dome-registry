import {PassportStrategy} from '@nestjs/passport';
import {Profile, Strategy, VerifyCallback} from 'passport-orcid';
import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {UserService} from "../user/user.service";

@Injectable()
export class OrcidOauthStrategy extends PassportStrategy(Strategy, 'orcid') {

    constructor(
        private readonly configService: ConfigService,
        private readonly userService: UserService,
    ) {
        // Call parent constructor, pass validation function
        super(
            // Define configuration settings
            {
                sandbox: configService.get<boolean>('auth.orcid.sandbox'),
                state: false,  // Enable this if using sessions
                clientID: configService.get<string>('auth.orcid.app'),
                clientSecret: configService.get<string>('auth.orcid.secret'),
                callbackURL: configService.get<string>('auth.orcid.url'),
            },
            // Define callback function
            async (accessToken: string, refreshToken: string, params: any, profile: Profile, done: VerifyCallback) => {
                // Create/update user using parameters retrieved from ORCID
                let user = await this.userService.upsertByOrcid({ orcid: params.orcid, name: params.name });
                // Return user
                return done(null, user);
            }
        );
    }

}
