import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import {Observable, tap} from 'rxjs';
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class UserInterceptor implements NestInterceptor {

  // Dependency injection
  constructor(
      private readonly jwtService: JwtService,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<any> {
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
    req.user = user;
    // Continue execution
    return next.handle();
  }
}
