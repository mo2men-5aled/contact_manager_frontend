import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactDashboardPage } from './dashboard';

describe('Dashboard', () => {
  let component: ContactDashboardPage;
  let fixture: ComponentFixture<ContactDashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactDashboardPage]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactDashboardPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
