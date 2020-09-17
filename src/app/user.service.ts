import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';

// import { NgxUiLoaderService } from 'ngx-ui-loader';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};

@Injectable({
  providedIn: "root"
})


export class UserService {
  // uri = "http://192.168.0.111:9000";k
  uri ="http://localhost:9000";
  constructor(private http: HttpClient, private router: Router) {}
  private httpErrorHandler(error) {
    if (error.status === 400) {
      return error.error;
    } else if (error.status === 401) {
      this.router.navigate(['login']);
      return { err: 'Unauthorised request!' };
    } else if (error.status === 0) {
      return { err: 'Error comunicating to server! Please check your connectivity!!' };
    } else {
      return { err: error };
    }
  }


  getauthUser( uDetail): any {
  // console.log(uDetail)
  const obj = uDetail;
  return this.http.post(`${this.uri}/api/authUser`, obj)
}


createUser( obj): any {
  return this.http.post(`${this.uri}/api/createUser`, obj)
}

getUsers( uDetail= {}): any {
  return this.http.get(`${this.uri}/api/getUsers`, uDetail)
} 

updateUser( uDetail): any {
  return this.http.post(`${this.uri}/api/updateUser`, uDetail)
} 





}
