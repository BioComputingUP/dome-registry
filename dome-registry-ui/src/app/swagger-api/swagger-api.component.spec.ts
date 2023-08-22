import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SwaggerAPiComponent } from './swagger-api.component';

describe('SwaggerAPiComponent', () => {
  let component: SwaggerAPiComponent;
  let fixture: ComponentFixture<SwaggerAPiComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ SwaggerAPiComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SwaggerAPiComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
