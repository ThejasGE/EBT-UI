
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Subject } from 'rxjs/internal/Subject';



@Injectable({
  providedIn: 'root'
})
export class AdapptWifiObservableService {
  private updateSubject = new Subject<any>();

  constructor() { }

  updateTrigger(): Observable<any> {
    return this.updateSubject.asObservable();
  }
  notifyUpdate() {
    this.updateSubject.next();
  }
}
