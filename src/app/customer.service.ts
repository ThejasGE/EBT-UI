import { Injectable } from "@angular/core";
import { HttpClient,HttpHeaders } from "@angular/common/http";
import { Router } from '@angular/router';
import { JwtModule } from '@auth0/angular-jwt';
import { CookieService } from 'ngx-cookie-service';
// import { NgxUiLoaderService } from 'ngx-ui-loader';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};

    JwtModule.forRoot({
      config: {
        tokenGetter: function  tokenGetter() {
             return    this.cookieService.get('auth_token');},
        whitelistedDomains: ['localhost:9000'],
        // blacklistedRoutes: ['http://localhost:9000/auth/login']
      }
    })

@Injectable({
  providedIn: "root"
})


export class CustomerService {
  // uri = "http://192.168.0.111:9000";
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

  getDomainList(): any {
    const obj = {};
    // console.log(obj)
    return this.http.get(`${this.uri}/api/customers/getDomainList`, obj);
  }



  getCustomer(): any {
    return this.http.get(`${this.uri}/api/customers/getCustomer/:cid`);
  } 


  getAllCustomers() :any {
    return this.http.get(`${this.uri}/api/customers/all`);
  }
  createCustomer(obj): any {
    return this.http.post(`${this.uri}/api/customers/createCustomer`, obj);
    
  }  
  deleteCustomer(obj): any {
    return this.http.post(`${this.uri}/api/customers/deleteCustomer`, obj);
    
  }

  updateServices(obj): any {
    return this.http.post(`${this.uri}/api/customers/updateServices`, obj);
    
  }
  selectedService(cid):any{
    // console.log(cid)
    return this.http.get(`${this.uri}/api/customers/selectedServices/`+cid
    );  
  }

  getCustomersStatus() {
    return this.http.get(
      `${this.uri}/api/customers/getCustomersStatus`
    );
  }

}
