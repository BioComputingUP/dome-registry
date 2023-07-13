import {createParamDecorator, ExecutionContext} from "@nestjs/common";

// Export user decorator
export const User = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
    // Retrieve HTTP request out of context
    const req = ctx.switchToHttp().getRequest();
    // Retrieve (partial) user out of request, if any
    return req.user;
});
