import {ConfigModule, ConfigService} from '@nestjs/config';
import {Module} from '@nestjs/common';
import {JwtModule, JwtService} from "@nestjs/jwt";
import {JwtAuthService} from './jwt-auth.service';
import {JwtAuthStrategy} from "./jwt-auth.strategy";
import { UserModule } from '../user/user.module';


@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            // Initializes JWT module
            useFactory: async (configService: ConfigService) => ({
                secret: configService.get<string>('auth.jwt.secret'),
                signOptions: {
                    expiresIn: configService.get<string>('auth.jwt.expires')
                }
            }),
        }),
        ConfigModule,
        UserModule
    ],
    providers: [JwtAuthStrategy, JwtAuthService],
    exports: [JwtModule, JwtAuthService],
})
export class JwtAuthModule {
}
