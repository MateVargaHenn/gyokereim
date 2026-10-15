import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WebSettings } from './web-settings';

describe('WebSettings', () => {
  let component: WebSettings;
  let fixture: ComponentFixture<WebSettings>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WebSettings],
    }).compileComponents();

    fixture = TestBed.createComponent(WebSettings);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
