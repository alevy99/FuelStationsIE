import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonCard, IonCardContent } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Station } from '../../models/station.model';
import { getBrandLogoURL } from 'src/app/shared/station-utils';
import { FuelPrice } from '../../services/fuel-prices-service';

@Component({
  selector: 'app-station-card',
  templateUrl: './station-card.component.html',
  styleUrls: ['./station-card.component.scss'],
  imports: [CommonModule, IonCard, IonCardContent],
})
export class StationCardComponent {
  @Input() station!: Station;
  @Input() fuelPrice?: FuelPrice;

  constructor(private router: Router) {}

  getLogoUrl(brand: string | null): string | null {
    return getBrandLogoURL(brand);
  }

  get coords(): string {
    return `${this.station.lat.toFixed(4)}, ${this.station.lon.toFixed(4)}`;
  }

  openDetail() {
    this.router.navigate(['/station', this.station.id], {
      state: { station: this.station }
    });
  }
}