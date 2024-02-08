import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DSWCardComponent } from './dsw-card.component';

describe('DSWCardComponent', () => {
  let component: DSWCardComponent;
  let fixture: ComponentFixture<DSWCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DSWCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DSWCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
