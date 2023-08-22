import { INestApplication } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

export function swaggerSetup(app:INestApplication) {
    const config = new DocumentBuilder()
      .setTitle('DOME API Documentation')
      // .addServer('http://localhost:8118/dome')
      .setVersion('1.0')
     
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  
}