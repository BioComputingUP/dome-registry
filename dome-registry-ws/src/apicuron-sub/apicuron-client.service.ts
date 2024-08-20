import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { HTTP_TOKEN_INJECTION } from "./constants";
import { HttpService } from "@nestjs/axios";
import { OnEvent } from "@nestjs/event-emitter";
import { WizardsCreatedEvent } from "./events";
import { map } from "rxjs";
import axios from "axios";
import { response } from "express";

@Injectable()
export class ClientService {
  constructor(
    @Inject(HTTP_TOKEN_INJECTION) protected token: string,
    protected http: HttpService
  ) {}


  // Event listener on the WizardscreatedEventName:
  @OnEvent(WizardsCreatedEvent.name, { promisify: true, async: true })
  async eventHandler(data: WizardsCreatedEvent) {
    console.log("triggered");
    console.log(data);
     // send  Post request to APICURON with Token (hidden)  
    //  await axios.post('https://apicuron.org/api/reports/single/', data.toObject(), {
    //   headers:{
    //      'Version': '2',
    //     'Authorization':`Bearer ${this.token}`,
    //     'Content-Type':'application/json',
    //   }
    //  }).then(response => {
    //   console.log(response.data);
    //  }).catch(error =>{
    //   if(error.response){
    //     console.log('Error',error.response.data);
    //   }else if (error.request){
    //     console.log('No response received ',error.request);
    //   }else {
    //     console.log(Error, error.message);
    //   }
    //  });



   
  }
}
