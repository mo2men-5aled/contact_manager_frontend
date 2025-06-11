import { TestBed } from '@angular/core/testing';

import { LockSocketServiceTs } from './lock-socket.service.ts';

describe('LockSocketServiceTs', () => {
  let service: LockSocketServiceTs;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LockSocketServiceTs);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
