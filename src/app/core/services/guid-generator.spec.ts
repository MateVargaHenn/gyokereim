import { TestBed } from '@angular/core/testing';

import { GuidGenerator } from './guid-generator';

describe('GuidGenerator', () => {
  let service: GuidGenerator;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GuidGenerator);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
