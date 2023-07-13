import { Module } from '@nestjs/common';
import { OrcidOauthController } from './orcid-oauth.controller';
import { OrcidOauthStrategy } from './orcid-oauth.strategy';
import { JwtAuthModule } from "../jwt-auth/jwt-auth.module";
import { UserModule } from "../user/user.module";

@Module({
  imports: [UserModule, JwtAuthModule],
  controllers: [OrcidOauthController],
  providers: [OrcidOauthStrategy],
})
export class OrcidOauthModule {}
