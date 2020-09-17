import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomedisplayComponent } from './homedisplay.component';

describe('HomedisplayComponent', () => {
  let component: HomedisplayComponent;
  let fixture: ComponentFixture<HomedisplayComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomedisplayComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HomedisplayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
