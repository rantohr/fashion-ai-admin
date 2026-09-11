import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScenarioForm } from './scenario-form';

describe('ScenarioForm', () => {
  let component: ScenarioForm;
  let fixture: ComponentFixture<ScenarioForm>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioForm],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenarioForm);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
