import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { IonCard, IonCardContent, IonBadge, IonIcon, ModalController } from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { Station } from '../../models/station.model';
import { getBrandLogoURL } from 'src/app/shared/station-utils';
import { FuelPrice } from '../../services/fuel-prices-service';
import { ReportModalComponent } from '../report-modal/report-modal.component';

@Component({
  selector: 'app-station-card',
  templateUrl: './station-card.component.html',
  styleUrls: ['./station-card.component.scss'],
  imports: [CommonModule, IonCard, IonCardContent],
})
export class StationCardComponent {
  @Input() station!: Station;
  @Input() fuelPrice?: FuelPrice;

  constructor(
    private router: Router,
    private modalCtrl: ModalController
  ) {}

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

  async openReport(event: Event) {
    event.stopPropagation();

    const modal = await this.modalCtrl.create({
      component: ReportModalComponent,
      componentProps: {
        station: this.station,
        currentPrice: this.fuelPrice
      },
      breakpoints: [0, 0.9],
      initialBreakpoint: 0.9,
    });

    await modal.present();
  }
}