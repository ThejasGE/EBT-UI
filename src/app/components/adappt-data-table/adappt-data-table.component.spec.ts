import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdapptDataTableComponent } from './adappt-data-table.component';
import { MaterialModule } from '../adappt-material/material.module';
import { SharedModule } from '../shared/shared.module';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AdapptDataTableComponent', () => {
  let component: AdapptDataTableComponent;
  let fixture: ComponentFixture<AdapptDataTableComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule,RouterModule, ReactiveFormsModule, FormsModule, HttpClientTestingModule
      ],
      declarations: [ AdapptDataTableComponent ],
      providers: [ ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdapptDataTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    let app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  });
});
