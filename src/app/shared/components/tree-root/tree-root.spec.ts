import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TreeRoot } from './tree-root';

describe('TreeRoot', () => {
  let component: TreeRoot;
  let fixture: ComponentFixture<TreeRoot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TreeRoot],
    }).compileComponents();

    fixture = TestBed.createComponent(TreeRoot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
