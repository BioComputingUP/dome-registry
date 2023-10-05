import {Module} from "@nestjs/common";
// Import modules
import {ConfigModule, ConfigService} from "@nestjs/config";
import {MongooseModule} from "@nestjs/mongoose";
import {ThrottlerModule} from "@nestjs/throttler";
import {OrcidOauthModule} from "./orcid-oauth/orcid-oauth.module";
import {JwtAuthModule} from "./jwt-auth/jwt-auth.module";
import {ReviewModule} from "./review/review.module";
import {UserModule} from "./user/user.module";
// Import application
import {AppController} from "./app.controller";
import {AppService} from "./app.service";

// Import configuration function
import { configuration } from "./config/configuration";


@Module({
    imports: [
        // Initialize configuration module
        // https://docs.nestjs.com/techniques/configuration
        // https://dev.to/pitops/managing-multiple-environments-in-nestjs-71l
        ConfigModule.forRoot({
            // envFilePath: `${process.cwd()}/config/environments/${process.env.NODE_ENV}.yaml`,
            load: [configuration],
            isGlobal: true
        }),
        // Initialize throttle rate
        ThrottlerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => ({
                ttl: configService.get<number>('throttle.ttl'),
                limit: configService.get<number>('throttle.limit'),
            }),
        }),
        // Initialize mongoose module (MongoDB)
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            // Configure Mongoose module
            useFactory: async (configService: ConfigService) => {
                // Define mongo parameters
                let mongo = configService.get<{host: string, port: number, user: string, secret: string, name: string}>('mongo');

                console.log('Loaded Mongo Config', mongo)

                // Define authorization part of URI
                let auth = mongo.user && mongo.secret ? `${mongo.user}:${mongo.secret}@`: '';
                // Define connection part of URI
                let connect = `${mongo.host}:${mongo.port}/${mongo.name}`;
                // Return complete URI
                return {uri: `mongodb://${auth}${connect}`};
            },
        }),
        // Import custom modules
        OrcidOauthModule,
        JwtAuthModule,
        ReviewModule,
        UserModule,
    ],
    controllers: [AppController],
    providers: [AppService]
})
export class AppModule {
}
