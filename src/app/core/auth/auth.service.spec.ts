import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';

// logout() navigates to /login - give the router a real (empty) route to
// match so that navigation doesn't reject with NG04002 in tests.
@Component({ template: '' })
class LoginStub {}

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'login', component: LoginStub }]),
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('starts unauthenticated with no stored token', () => {
    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
  });

  it('stores the token and user on successful login', () => {
    const user = { id: '1', email: 'admin@fashion-ai.local', name: 'Admin', role: 'ADMIN' };

    service.login('admin@fashion-ai.local', 'admin123').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush({ accessToken: 'a-token', user });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.currentUser()).toEqual(user);
    expect(service.getToken()).toBe('a-token');
    expect(localStorage.getItem('fashion_ai_admin_token')).toBe('a-token');
  });

  it('does not authenticate on a failed login', () => {
    service.login('admin@fashion-ai.local', 'wrong').subscribe({ error: () => undefined });

    const req = httpMock.expectOne('http://localhost:3000/auth/login');
    req.flush({ message: 'Invalid email or password.' }, { status: 401, statusText: 'Unauthorized' });

    expect(service.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('fashion_ai_admin_token')).toBeNull();
  });

  it('clears state on logout', () => {
    const user = { id: '1', email: 'admin@fashion-ai.local', name: 'Admin', role: 'ADMIN' };
    service.login('admin@fashion-ai.local', 'admin123').subscribe();
    httpMock.expectOne('http://localhost:3000/auth/login').flush({ accessToken: 'a-token', user });

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.currentUser()).toBeNull();
    expect(localStorage.getItem('fashion_ai_admin_token')).toBeNull();
  });
});
