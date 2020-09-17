import { Component, OnInit, Input, Output, EventEmitter, ChangeDetectionStrategy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import * as jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

declare var xepOnline: any;

@Component({
  selector: "billing-dashboard",
  templateUrl: "billing.component.html",
  styleUrls: ['billing.component.scss'],


  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BillingComponent implements OnInit {
  @ViewChild('htmlData') htmlData:ElementRef;
  @Input() checkBox: any [];
  // @Input() printDocument;
  @Input() tableData: any [];
  @Output() getDataByDates = new EventEmitter<any>();
  @Output() getselectUpdated = new EventEmitter<any>();
  @Output() applyFilter = new EventEmitter<any>();
  // @Input() sendMails;
  @Input() selected ;
  @Input() tableFieldsName;
  selectedValue: string;
  filterData: string;
  begin:string;
  end:string;



  constructor(private cdRef: ChangeDetectorRef) {}

  ngOnInit() {

  }


  sendDataByDates() {
    this.getDataByDates.emit(this.selected);
    this.cdRef.detectChanges();
    console.log(this.selected)
    let startDate = this.selected.begin;
    this.begin=startDate.toDateString();
    console.log(this.begin)
    let endDate = this.selected.end;
    this.end=endDate.toDateString();
    console.log(this.end)
  }


  openPDF():void {
    let DATA = this.htmlData.nativeElement;
    let doc = new jsPDF('p','pt', 'a4');
    doc.fromHTML(DATA.innerHTML,30,30);
    doc.output('dataurlnewwindow');
  }

  downloadPDF() :void{
    let DATA = this.htmlData.nativeElement;
    let doc = new jsPDF('p','pt', 'a4');

    let handleElement = {
      '#editor':function(element,renderer){
        return true;
      }
    };
    doc.fromHTML(DATA.innerHTML,15,15,{
      'width': 200,
      'elementHandlers': handleElement
    });
    doc.save('angular-demo.pdf');
    // return xepOnline.Formatter.Format('htmlData',{render:'download'});
  }

}
