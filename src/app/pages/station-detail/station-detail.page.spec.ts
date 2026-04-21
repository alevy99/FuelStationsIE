import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StationDetailPage } from './station-detail.page';

describe('StationDetailPage', () => {
  let component: StationDetailPage;
  let fixture: ComponentFixture<StationDetailPage>;

  beforeEach(() => {
    fixture = TestBed.createComponent(StationDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
