import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonButton, IonButtons, IonIcon, IonItem,
  IonLabel, IonInput
} from '@ionic/angular/standalone';
import { ModalController } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { closeOutline, checkmarkOutline } from 'ionicons/icons';
import { Station } from '../../models/station.model';
import { FuelPrice, FuelPricesService } from '../../services/fuel-prices-service';

@Component({
  selector: 'app-report-modal',
  templateUrl: './report-modal.component.html',
  styleUrls: ['./report-modal.component.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonButton, IonButtons, IonIcon, IonItem,
    IonLabel, IonInput
  ]
})
export class ReportModalComponent {
  @Input() station!: Station;
  @Input() currentPrice?: FuelPrice;

  dieselAvailable: boolean | null = null;
  petrolAvailable: boolean | null = null;
  litreLimit: number | null = null;
  priceLimit: number | null = null;
  diesel: number | null = null;
  petrol: number | null = null;

  submitting = false;

  constructor(
    private modalCtrl: ModalController,
    private fuelPricesService: FuelPricesService
  ) {
    addIcons({ closeOutline, checkmarkOutline });
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  submit() {
    this.submitting = true;

    this.fuelPricesService.reportPrice({
      stationId: String(this.station.id),
      petrol: this.petrol,
      diesel: this.diesel,
      petrolAvailable: this.petrolAvailable,
      dieselAvailable: this.dieselAvailable,
      priceLimit: this.priceLimit,
      litreLimit: this.litreLimit,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.modalCtrl.dismiss({ updated: true });
      },
      error: (err) => {
        console.error('Error submitting report:', err);
        this.submitting = false;
      }
    });
  }
}