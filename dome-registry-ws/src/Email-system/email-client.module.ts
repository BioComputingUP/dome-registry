import { Injectable, Module } from "@nestjs/common";
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from "@nestjs/config";
import { MailerModule, MailerService } from '@nestjs-modules/mailer';
import { EmailService } from "./email-client.service";
import { ConfigModule } from '@nestjs/config';
import { debug } from "console";


@Module({
    imports: [
       
        MailerModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (configService: ConfigService) => ({
           transport: {
              host: configService.get('email.host'),
              port: Number(configService.get('email.SMTP')),
              secure: true ,
              auth: {
                user: configService.get('email.username'),
                pass: configService.get('email.password'),
              },
             
            },
            defaults: {
              from: '"DOME ML" info@dome-ml.org',
            },
            transportOptions:{
              logger: true,
              debug: true,
              socketTimeout:60000,
            }

          }),
        }),
      ],
      providers:[EmailService],
      exports:[EmailService],
    

})

export class EmailModule {



}