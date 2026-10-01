import { TestBed } from '@angular/core/testing';

import { CookieManagement } from './cookie-management';

describe('CookieManagement', () => {
  let service: CookieManagement;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CookieManagement);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
