import { TestBed } from '@angular/core/testing';
import { ResolveFn } from '@angular/router';

import { loaderResolver } from './loader.resolver';

describe('loaderResolver', () => {
  const executeResolver: ResolveFn<boolean> = (...resolverParameters) => 
      TestBed.runInInjectionContext(() => loaderResolver(...resolverParameters));

  beforeEach(() => {
    TestBed.configureTestingModule({});
  });

  it('should be created', () => {
    expect(executeResolver).toBeTruthy();
  });
});
