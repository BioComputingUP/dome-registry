import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ConfigService } from "@nestjs/config";
import { Strategy, ExtractJwt } from "passport-jwt";


@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy) {

  // Constructor
  constructor(private readonly configService: ConfigService) {
    // Define function for extracting JWT from cookie (first option)
    const extractJwtFromCookie = (req) => {
      // Initialize token
      let token = null;
      // Case cookies are set
      if (req && req.cookies) {
        // Set token
        token = req.cookies['jwt'];
      }
      // Return token if set in cookies, otherwise fall back to header
      return token || ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    }

    // Call parent constructor
    super({
      // Instruct strategy to retrieve JWT out of cookie
      jwtFromRequest: extractJwtFromCookie,
      // Ensure expiration date gets checked
      ignoreExpiration: false,
      // Use private secret to validate
      secretOrKey: configService.get<string>('auth.jwt.secret'),
    });
  }

  // Validate JWT
  // https://docs.nestjs.com/security/authentication#implementing-passport-jwt
  async validate(payload: any) {
    // Here, we're guaranteed that we're receiving a valid token
    return { _id: payload._id, orcid: payload.orcid };
  }

}
