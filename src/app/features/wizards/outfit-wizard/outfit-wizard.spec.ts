import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OutfitWizard } from './outfit-wizard';

describe('OutfitWizard', () => {
  let component: OutfitWizard;
  let fixture: ComponentFixture<OutfitWizard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OutfitWizard],
    }).compileComponents();

    fixture = TestBed.createComponent(OutfitWizard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
