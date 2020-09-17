import {
  Component,
  OnInit,
  Input,
  ViewChild,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  EventEmitter,
  Output,
  Inject
} from "@angular/core";

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
  MatChipInputEvent
} from '@angular/material/chips'
import { SelectionModel } from "@angular/cdk/collections";
import { COMMA, ENTER } from "@angular/cdk/keycodes";

// import * as moment from "moment";
// import * as moment from 'moment-timezone';
import { ClientServicesComponent } from "../../pages/client-services/client-services.component";
import {MatFormFieldModule} from '@angular/material/form-field';
// import { DialogContainerComponent } from "../dialog-container/dialog-container.component";
// import { NotesComponent } from "../notes/notes.component";
// import { LoadercomComponent } from "../loadercom/loadercom.component";
import { CustomerService } from '../../customer.service';
import { NgxUiLoaderService } from 'ngx-ui-loader';
import {UpdateServiceDialogComponent} from '../../pages/client-services/client-services.component'
@Component({
  selector: "app-adappt-data-table",
  templateUrl: "./adappt-data-table.component.html",
  styleUrls: ["./adappt-data-table.component.scss"],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdapptDataTableComponent implements OnInit {
  constructor(
    private cdRef: ChangeDetectorRef,
    public matDialog: MatDialog, 
    private customer: CustomerService,
    private clientData: ClientServicesComponent,
    private ngxLoader: NgxUiLoaderService
  ) {}
  dataSource: MatTableDataSource<Object>;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];
  // selected = { begin: new Date(), end: new Date() };
  selectable = true;
  // services:Array<any> = [];
  removable = false;
  addOnBlur = true;
  selecttype = "desk";

  @Input() tableFields = [];
  @Input() selected;
  @Input() clients;
  @Input() refreshService;
  @Input() refreshData;
  @Input() tableFilter;
  @Output() rowSelect =  new EventEmitter<any>();
  @Output() filteredData = new EventEmitter<any>();
  dialogRef;
  displayedColumns: string[] = [];
  selection = new SelectionModel<Object>(true, []);
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  
  
  index = 0;
  ngOnInit() {
    this.displayedColumns.push('select');
    const fields = this.tableFields.map(field => field.objectName);
    this.displayedColumns = this.displayedColumns.concat(fields);

    this.dataSource = new MatTableDataSource(this.clients);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.cdRef.detectChanges();
 
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.tableFilter && this.dataSource) {
      this.dataSource.filter = this.tableFilter.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
        this.dataSource = new MatTableDataSource(this.clients);
        this.cdRef.detectChanges();
      }
    }
  
  }
  openDialog(objectName): void {
    this.ngxLoader.start();
    event.stopPropagation();
    // console.log(objectName)
    const dialogRef = this.matDialog.open(UpdateServiceDialogComponent, {
      data:{objectName}
    });

   
    dialogRef.afterClosed().subscribe(() => { this.clients; } );
      // this.dialogRef.dismiss(result)
    
    this.ngxLoader.stop()
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  isString(val) {
    return typeof val === "object";
  }

  /** Selects all rows if they are not all selected; otherwise clear selection. */
  masterToggle() {
    if(this.isAllSelected()){
      this.selection.clear();
      this.rowSelect.emit([]);
    } else {
      this.dataSource.data.forEach(row => this.selection.select(row));
      this.rowSelect.emit(this.selection.selected);
    }

    console.log(this.rowSelect,"rowSelect")
}

  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;
  }
}
