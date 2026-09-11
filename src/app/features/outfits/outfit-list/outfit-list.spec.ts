import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { OutfitList } from './outfit-list';

describe('OutfitList', () => {
  let component: OutfitList;
  let fixture: ComponentFixture<OutfitList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutfitList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(OutfitList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
