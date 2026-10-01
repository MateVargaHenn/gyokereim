import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CookiePanel } from './cookie-panel';

describe('CookiePanel', () => {
  let component: CookiePanel;
  let fixture: ComponentFixture<CookiePanel>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CookiePanel],
    }).compileComponents();

    fixture = TestBed.createComponent(CookiePanel);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
