import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule, Location } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Storage } from '@ionic/storage-angular';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButtons, IonIcon, IonBackButton
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkOutline } from 'ionicons/icons';
import { Station } from '../../models/station.model';
import { FuelPriceReport, FuelPricesService } from '../../services/fuel-prices-service';

@Component({
  selector: 'app-report',
  templateUrl: './report.page.html',
  styleUrls: ['./report.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButtons, IonIcon, IonBackButton
  ]
})
export class ReportPage implements OnInit {
  readonly MIN_PRICE = 1.3;
  readonly MAX_PRICE = 3.0;
  readonly MIN_LITRES = 1;
  readonly MAX_LITRES = 200;
  readonly MIN_SPEND = 1;
  readonly MAX_SPEND = 500;

  station!: Station;

  dieselAvailable: boolean | null = null;
  petrolAvailable: boolean | null = null;
  litreLimit: number | null = null;
  priceLimit: number | null = null;
  diesel: number | null = null;
  petrol: number | null = null;

  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fuelPricesService: FuelPricesService,
    private location: Location,
    private storage: Storage
  ) {
    addIcons({ checkmarkOutline });
  }

  ngOnInit() {
    this.station = history.state?.station;

    if (!this.station) {
      const id = this.route.snapshot.paramMap.get('stationId');
      console.warn('No station in state, id from URL:', id);
    }
  }

  submit() {
    if (!this.isPriceValid) {
      console.warn('Invalid price');
      return;
    }

    this.submitting = true;

    const report: FuelPriceReport = {
      stationId: String(this.station.id),
      petrol: this.petrol,
      diesel: this.diesel,
      petrolAvailable: this.petrolAvailable,
      dieselAvailable: this.dieselAvailable,
      priceLimit: this.priceLimit,
      litreLimit: this.litreLimit,
    };

    this.fuelPricesService.reportPrice(report).subscribe({
      next: async () => {
        this.submitting = false;

        await this.storage.set('optimisticPrice', {
          stationId: String(this.station.id),
          petrol: this.petrol,
          diesel: this.diesel,
          petrolAvailable: this.petrolAvailable,
          dieselAvailable: this.dieselAvailable,
          priceLimit: this.priceLimit,
          litreLimit: this.litreLimit,
          timestamp: new Date().toISOString(),
          reportCount: 0
        });

        this.location.back();
      },
      error: (err) => {
        console.error('Error submitting report:', err);
        this.submitting = false;

        if (err.status === 400) {
          alert(err.error?.error ?? 'Invalid data');
        }
      }
    });
  }

  get isPriceValid(): boolean {
    if (this.petrol !== null && (this.petrol < this.MIN_PRICE || this.petrol > this.MAX_PRICE)) return false;
    if (this.diesel !== null && (this.diesel < this.MIN_PRICE || this.diesel > this.MAX_PRICE)) return false;
    return true;
  }
}