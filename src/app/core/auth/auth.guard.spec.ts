import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { UrlTree, provideRouter } from '@angular/router';
import { authGuard } from './auth.guard';

// AuthService reads its token from localStorage in a field initializer, so
// each case needs a fresh TestBed constructed after localStorage is set up,
// not just a fresh AuthService instance.
function configureTestBed(): void {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({ providers: [provideRouter([]), provideHttpClient()] });
}

describe('authGuard', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('redirects to /login when not authenticated', () => {
    localStorage.clear();
    configureTestBed();

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBeInstanceOf(UrlTree);
    expect((result as UrlTree).toString()).toBe('/login');
  });

  it('allows navigation when a token is present', () => {
    localStorage.setItem('fashion_ai_admin_token', 'fake-token');
    configureTestBed();

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });
});
