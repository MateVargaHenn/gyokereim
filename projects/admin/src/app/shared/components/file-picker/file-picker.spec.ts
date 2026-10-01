import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilePicker } from './file-picker';

describe('FilePicker', () => {
  let component: FilePicker;
  let fixture: ComponentFixture<FilePicker>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FilePicker],
    }).compileComponents();

    fixture = TestBed.createComponent(FilePicker);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
