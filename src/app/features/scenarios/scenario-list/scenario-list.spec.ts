import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { ScenarioList } from './scenario-list';

describe('ScenarioList', () => {
  let component: ScenarioList;
  let fixture: ComponentFixture<ScenarioList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScenarioList],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(ScenarioList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
