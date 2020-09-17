import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WificonfigComponent } from './wificonfig.component';

describe('WificonfigComponent', () => {
  let component: WificonfigComponent;
  let fixture: ComponentFixture<WificonfigComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WificonfigComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WificonfigComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
