import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DevicesTableGenericComponent } from './devices-table-generic.component';
import { MaterialModule } from '../adappt-material/material.module';
import { SharedModule } from '../shared/shared.module';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('DevicesTableGenericComponent', () => {
  let component: DevicesTableGenericComponent;
  let fixture: ComponentFixture<DevicesTableGenericComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        MaterialModule, FormsModule, HttpClientTestingModule
      ],
      declarations: [ DevicesTableGenericComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DevicesTableGenericComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
