import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { authInterceptor } from './auth.interceptor';

describe('authInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('attaches a Bearer token when one is stored', () => {
    localStorage.setItem('fashion_ai_admin_token', 'a-token');

    http.get('http://localhost:3000/brands').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/brands');
    expect(req.request.headers.get('Authorization')).toBe('Bearer a-token');
    req.flush([]);
  });

  it('sends no Authorization header when there is no token', () => {
    http.get('http://localhost:3000/brands').subscribe();

    const req = httpMock.expectOne('http://localhost:3000/brands');
    expect(req.request.headers.has('Authorization')).toBe(false);
    req.flush([]);
  });
});
