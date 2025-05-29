import { Inject, Injectable } from "@nestjs/common";
import { HTTP_TOKEN_INJECTION } from "./constants";
import { HttpService } from "@nestjs/axios";
import { OnEvent } from "@nestjs/event-emitter";
import axios from "axios";
import { ReviewCreatedEvent } from "../review/events/review-created.event";

@Injectable()
export class ClientService {
  constructor(
    @Inject(HTTP_TOKEN_INJECTION) protected token: string,
    protected http: HttpService,
  ) {}


  // Event listener on the WizardscreatedEventName:
  @OnEvent(ReviewCreatedEvent.name, { promisify: true, async: true })
  async eventHandler({ review, creator: user }: ReviewCreatedEvent) {

    const data2 = {
      curator_orcid: user.orcid,
      timestamp: review.created,
      entity_uri: "https://registry.dome-ml.org/review/" + review.shortid,
      activity_term: "annotation_submitted",
      resource_id: "dome_id",
    };


    console.log("api curon report submission triggered");
    //console.log(data);

    console.log(data2);
     //send  Post request to APICURON with Token (hidden)  
     await axios.post('https://apicuron.org/api/reports/single/', data2, {
      headers:{
         'Version': '2',
        'Authorization':`Bearer ${this.token}`,
        'Content-Type':'application/json',
      }
     }).then(response => {
      console.log(response.data);
     }).catch(error =>{
      if(error.response){
        console.log('Error',error.response.data);
      }else if (error.request){
        console.log('No response received ',error.request);
      }else {
        console.log(Error, error.message);
      }
     });



   
  }}