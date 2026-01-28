import { TestBed } from '@angular/core/testing';

import { F1 } from './f1';

describe('F1', () => {
  let service: F1;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(F1);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
