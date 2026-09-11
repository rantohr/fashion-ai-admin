import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutfitForm } from './outfit-form';

describe('OutfitForm', () => {
  let component: OutfitForm;
  let fixture: ComponentFixture<OutfitForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutfitForm],
    }).compileComponents();

    fixture = TestBed.createComponent(OutfitForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
