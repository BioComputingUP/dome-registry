import { NestFactory } from "@nestjs/core";
import { Logger, ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as cookieParser from 'cookie-parser';
import { AppModule } from "./app.module";
import { swaggerSetup } from "./swagger/swagger";
import * as bodyParser from 'body-parser'
import 'reflect-metadata';
import 'module-alias/register';

async function bootstrap() {
    // Instantiate application
    const app = await NestFactory.create(AppModule);

    const logger = new Logger('AppLogger');

    // Retrieve configuration service
    const configService = app.get(ConfigService);
    // Enable cookie parser
    app.use(cookieParser());
    // Enable CORS
    app.enableCors({
        origin: true,
        methods: ["GET", "POST", "PUT", "PATCH", "POST", "DELETE"],
        credentials: true,
    });
    // Enable DTO validation
    app.useGlobalPipes(new ValidationPipe({ transform: true, skipNullProperties: false }));

    // SWAGGER API lunch
    swaggerSetup(app, configService.get<string>('API_PREFIX'));

    const port = configService.get<number>('server.port');
    logger.log(`Listening On port ${port}`)
    

    // Run application synchronously on given port
    await app.listen(port);
}
// Bootstrap application
bootstrap();
