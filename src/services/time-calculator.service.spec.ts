import { TestBed } from '@angular/core/testing';

import { TimeCalculatorService } from './time-calculator.service';

describe('TimeCalculatorService', () => {
  let service: TimeCalculatorService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TimeCalculatorService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
