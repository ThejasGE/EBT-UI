import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { AdapptHttpInterceptorService } from './adappt-http-auth-interceptor';


export const httpInterceptorProviders = [
  { provide: HTTP_INTERCEPTORS, useClass: AdapptHttpInterceptorService, multi: true }
];
