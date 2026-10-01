import { TestBed } from '@angular/core/testing';

import { ServerStatus } from './server-status';

describe('ServerStatus', () => {
  let service: ServerStatus;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ServerStatus);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
