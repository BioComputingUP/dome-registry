import { Module } from "@nestjs/common";
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from "@nestjs/config";
import { HTTP_TOKEN_INJECTION } from "./constants";
import { ClientService } from "./apicuron-client.service";

@Module({
  imports: [HttpModule.register({})],
  providers: [
    {
        provide: HTTP_TOKEN_INJECTION,
        inject: [ConfigService],
        useFactory: (config: ConfigService) => {
            return config.get('APICURON')
        }
    },
    ClientService,
  ]
})
export class ApicuronModule {


    
}
