import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { HTTP_TOKEN_INJECTION } from "./constants";
import { HttpService } from "@nestjs/axios";
import { OnEvent } from "@nestjs/event-emitter";
import { WizardsCreatedEvent } from "./events";
import { map } from "rxjs";
import axios from "axios";
import { response } from "express";

@Injectable()
export class ClientService  {
  constructor(
    @Inject(HTTP_TOKEN_INJECTION) protected token: string,
    protected http: HttpService
  ) {}

 
 
  @OnEvent(WizardsCreatedEvent.name, { promisify: true, async: true })
  async eventHandler(data: WizardsCreatedEvent) {

  console.log('triggered');
  console.log(data)

  }}