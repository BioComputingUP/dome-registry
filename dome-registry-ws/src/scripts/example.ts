import { INestApplicationContext } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "src/app.module";

export async function example(app: INestApplicationContext){
    app
}


async function bootstrap(){
    const app = await NestFactory.createApplicationContext(AppModule);
    await example(app);
}

if(require.main === module){
    // direct call

    bootstrap();
}