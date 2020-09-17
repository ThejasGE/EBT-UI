import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { NgxUiLoaderService } from 'ngx-ui-loader';
const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'multipart/form-data'
  })
};
// const urlPrefix = '10.8.0.235';
const urlPrefix = 'http://192.168.1.3:8001';
@Injectable({
  providedIn: 'root'
})
export class AdapptHttpService {
  constructor(private http: HttpClient, private router: Router, private ngxService: NgxUiLoaderService) { }
  urlPrefix: string = urlPrefix;
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
  private jsonToFormData(jsonData, form, namespace) {
    const formData = form || new FormData();
    let formKey;
    Object.keys(jsonData).forEach(key => {
      if (jsonData[key] !== null && jsonData[key] !== undefined) {
        if (jsonData.hasOwnProperty(key)) {
          if (namespace) {
            formKey = namespace + '[' + key + ']';
          } else {
            formKey = key;
          }
          if (typeof jsonData[key] === 'object' && !(jsonData[key] instanceof File)) {
            this.jsonToFormData(jsonData[key], formData, formKey);
          } else {
            formData.append(formKey, jsonData[key]);
          }
        }
      }
    });
    return formData;
  }

  get(route, params = {}) {
    return new Promise((resolve, reject) => {
      this.ngxService.start();
      let URL: string;
      if (route[0] === '/') {
        URL = urlPrefix + route;
      } else {
        URL = urlPrefix + '/' + route;
      }
      this.http.get(URL, params).subscribe(
        (response: any) => {
          this.ngxService.stop();
          resolve(response);
        },
        error => {
          this.ngxService.stop();
          reject(this.httpErrorHandler(error));
        }
      );
    });
  }

  post(route, params) {
    return new Promise((resolve, reject) => {
      this.ngxService.start();
      const formData = this.jsonToFormData(params, null, null);
      let URL: string;
      if (route[0] === '/') {
        URL = urlPrefix + route;
      } else {
        URL = urlPrefix + '/' + route;
      }
      this.http.post(URL, formData).subscribe(
        response => {
          this.ngxService.stop();
          resolve(response);
        },
        error => {
          this.ngxService.stop();
          reject(this.httpErrorHandler(error));
        }
      );
    });
  }
}
