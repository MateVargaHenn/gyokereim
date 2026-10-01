import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceView } from './service-view';

describe('ServiceView', () => {
  let component: ServiceView;
  let fixture: ComponentFixture<ServiceView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ServiceView],
    }).compileComponents();

    fixture = TestBed.createComponent(ServiceView);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
