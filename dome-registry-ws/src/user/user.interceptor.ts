import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import {Observable, tap} from 'rxjs';
import {JwtService} from "@nestjs/jwt";
import { UserService } from './user.service';

@Injectable()
export class UserInterceptor implements NestInterceptor {

  // Dependency injection
  constructor(
      private readonly jwtService: JwtService,
      protected userService: UserService
  ) {}

  async intercept(ctx: ExecutionContext, next: CallHandler) {
    // Retrieve HTTP request out of context
    const req = ctx.switchToHttp().getRequest();
    // Initialize user
    let user = null;
    // Case token is set in cookies
    if (req && req.cookies && req.cookies['jwt']) {
      // Define token
      let token = req.cookies['jwt'];
      // Try decoding token
      user = this.jwtService.decode(token) as { _id: string } | null;
    }
    // Set user in request
    req.user = await this.userService.findByOrcid(user?.orcid);
    // Continue execution
    return next.handle();
  }
}
