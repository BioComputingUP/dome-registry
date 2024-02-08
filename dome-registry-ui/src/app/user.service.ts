import {environment as env} from "../environments/environment";
import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import * as core from "dome-registry-core";
import { Observable } from "rxjs";


export interface User extends core.User {
  // Add proxy authentication flag
  auth?: boolean;
}


@Injectable({
  providedIn: 'root'
})
export class UserService {

  private readonly url = env.backend + '/user'

  constructor(
    // Dependency injection
    private http: HttpClient,
  ) {}

  public getUser() {
    // Retrieve user from server
    return this.http.get<User>(this.url);
  }

  public getTotalNumber():Observable<number>{

    const total= this.http.get<number>(this.url + '/total')
    return total;
  }


  public  userInfo(id: any){
    return this.http.get<User>(this.url+'/owner'+id);
  }
}
