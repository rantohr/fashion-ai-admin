import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { BrandList } from './brand-list';

describe('BrandList', () => {
  let component: BrandList;
  let fixture: ComponentFixture<BrandList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BrandList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(BrandList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
