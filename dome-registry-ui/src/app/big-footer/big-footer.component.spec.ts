import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BigFooterComponent } from './big-footer.component';

describe('BigFooterComponent', () => {
  let component: BigFooterComponent;
  let fixture: ComponentFixture<BigFooterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BigFooterComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(BigFooterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
