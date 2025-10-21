import {ConfigModule, ConfigService} from '@nestjs/config';
import {Module} from '@nestjs/common';
import {JwtModule, JwtService, JwtModuleOptions} from "@nestjs/jwt";
import {JwtAuthService} from './jwt-auth.service';
import {JwtAuthStrategy} from "./jwt-auth.strategy";
import { UserModule } from 'src/user/user.module';


@Module({
    imports: [
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            // Initializes JWT module
            useFactory: async (configService: ConfigService): Promise<JwtModuleOptions> => {
                const expires = configService.get<string>('auth.jwt.expires');
                return {
                    secret: configService.get<string>('auth.jwt.secret'),
                    signOptions: {
                        // Cast to satisfy JwtModuleOptions typing (supports number or duration string)
                        expiresIn: expires as unknown as JwtModuleOptions['signOptions']['expiresIn']
                    }
                };
            },
        }),
        ConfigModule,
        UserModule
    ],
    providers: [JwtAuthStrategy, JwtAuthService],
    exports: [JwtModule, JwtAuthService],
})
export class JwtAuthModule {
}
