import { Component, OnInit, Input, ViewChild, ChangeDetectorRef, SimpleChanges, Output, EventEmitter } from '@angular/core';
import { ChangeDetectionStrategy } from '@angular/core';
import {
  MatPaginator} from "@angular/material/paginator";

import {
  MatSort
} from '@angular/material/sort';
import {
  MatTableDataSource
} from '@angular/material/table';
import {
  MatDialog
} from '@angular/material/dialog';
import { 
  MatSnackBar
} from '@angular/material/snack-bar'
import { SelectionModel } from '@angular/cdk/collections';
// import { NotesComponent } from '../notes/notes.component';
// import { LoadercomComponent } from '../loadercom/loadercom.component';
// import { HOSTTEMPLATE } from '../host/hostTemplates';
// import { CloudpcsService } from '../cloudpcs.service';
// import { DialogContainerComponent } from '../dialog-container/dialog-container.component';
// import { AdapptTimelineDevicesComponent } from '../adappt-timeline-devices/adappt-timeline-devices.component';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import { UserService } from '../../user.service';
import { AdapptAuthService } from '../../adappt-auth.service';

@Component({
  selector: 'app-devices-table-generic',
  templateUrl: './devices-table-generic.component.html',
  styleUrls: ['./devices-table-generic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DevicesTableGenericComponent implements OnInit {

  constructor(private cdRef: ChangeDetectorRef, public matDialog: MatDialog, private ngxLoader: NgxUiLoaderService,
    public auth: AdapptAuthService,public snackBar: MatSnackBar,
    private UserService: UserService) { }
  @Input() tableFields = [];
  @Input() tableData;
  @Input() tableFilter;
  @Input() selected;
  @Input() siteSelect;
  @Output() rowSelect =  new EventEmitter<any>();
  @Output() updatedRow = new EventEmitter<any>();
  @Output() filteredData =  new EventEmitter<any>();
  dialogRef;
  toggleSlide = false;
  selectedValue;
  displayedColumns: string[] = [];
  selection = new SelectionModel<Object>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<Object>;
  selecttype = "host";
  ngOnInit() { 
    this.displayedColumns.push('select');
    const fields = this.tableFields.map(field => field.objectName);
    this.displayedColumns = this.displayedColumns.concat(fields);
    // console.log(this.displayedColumns)
    this.dataSource = new MatTableDataSource(this.tableData);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // console.log(this.dataSource.data,"datasoure")
    this.cdRef.detectChanges();
    
  }
  masterToggle() {
      if(this.isAllSelected()){
        this.selection.clear();
        this.rowSelect.emit([]);
      } else {
        this.dataSource.data.forEach(row => this.selection.select(row));
        this.rowSelect.emit(this.selection.selected);
      }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.tableFilter && this.dataSource) {
      this.dataSource.filter = this.tableFilter.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
        this.filteredData.emit(this.dataSource.filteredData);
        this.cdRef.detectChanges();
      }
    }
    
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }


  onCtrlV() {
    let snackBarRef = this.snackBar.open(
      " Please Dont use Ctrl V",
      "thanks",
      {
        horizontalPosition: "left"
      }
    );
    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss()
    });
    console.log('ctrlV pressed')
  }

  onCtrlC() {
    let snackBarRef = this.snackBar.open(
      " Please Dont use Ctrl C",
      "thanks",
      {
        horizontalPosition: "left"
      }
    );
    snackBarRef.onAction().subscribe(() => {
      snackBarRef.dismiss()
    });

    console.log('ctrlC pressed')
  }




  // setReportissues(element: HOSTTEMPLATE) {
    

  //   let obj = {
  //     areaName: element.hostname,
  //     bleId: element.id,
  //     customers: element.sitename,
  //     buildings: element.buildingname,
  //     floors: element.floorname,
  //     bleaddress: "NO ADDRESS",
  //     lastresponsetime: element.lastresponse,
  //     noofresponses: element.hostlogtodaycount
  //   };
  //   // console.log(element,obj )
  //   const dialogRef = this.matDialog.open(NotesComponent, {
  //     width: '500px',
  //     height: '500px',
  //     data: obj
  //   })
  //   dialogRef.afterClosed().subscribe(async (result) => {
  //     let logRef;
  //     if (result != undefined) {
  //       this.ngxLoader.start()
  //       if (result.length > 0) {
  //         for await (let r of result) {
  //           if (this.tableData.length > 0) {
  //             for (let pcsData of this.tableData) {
  //               if (r.areaName == pcsData.areaName) {
  //                 pcsData.subject = r.subject
  //               }
  //             }
  //           }
  //         }
  //         this.cdRef.detectChanges();
  //         this.dataSource.data = [];
  //         this.ngxLoader.stop()
  //         this.dataSource.data = this.tableData;
  //       } else {
  //         logRef.close();
  //         console.log("no subject updated")
  //       }
  //     }

  //   })
  // }

  // openDialog(row: HOSTTEMPLATE): void {
  //   this.cdRef.detectChanges();
  //   this.ngxLoader.start()
  //   this.pcsData.getPlotMins(this.selected.begin, this.selected.end, row.id, row.sitename, row.timezone, "", row.hostname, "", row.floorname, row.buildingname, this.selecttype).subscribe((data: Object[]) => {
  //     // this.dialogRef.close();
  //     this.dialogRef = this.matDialog.open(AdapptTimelineDevicesComponent, {
  //       width: "70%",
  //       height: "80%",
  //       data: data,
  //     })
  //     this.ngxLoader.stop()
  //     this.dialogRef.afterClosed().subscribe()
  //   })
  // }

  updateProfile(value: any) {
    // if(value.Buildings.length > 0){
    //   let temp = [];
    //   value.Buildings.forEach(ele => {
    //     for( let site of this.siteSelect) {
    //       for( let bui of site.buildings) {
    //         if( bui.id === ele){
    //           bui.subdomain = site.name;
    //           temp.push(bui)
    //         }
    //       }
    //     }
    //   });
    //   value.Buildings = [...temp];
    // }

    console.log("userUpdate", value)
    this.UserService.updateUser(value).subscribe( data => {
      this.updatedRow.emit(data);
    } )
    }

  getselectUpdateds(event) {
    console.log(event)
  }

}
