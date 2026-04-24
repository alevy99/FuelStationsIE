import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption, IonSpinner, IonButton, IonRange, IonIcon, IonButtons } from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';
import { Geolocation } from '@capacitor/geolocation';
import { addIcons } from 'ionicons';
import { informationCircleOutline, locationOutline } from 'ionicons/icons';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

import { COUNTIES, County } from '../shared/counties';
import { OverpassService } from '../services/overpass-service';
import { Station } from '../models/station.model';
import { StationCardComponent } from '../components/station-card/station-card.component';
import { FuelPricesService, FuelPrice } from '../services/fuel-prices-service';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonSelect, IonSelectOption,
    IonSpinner, StationCardComponent,
    IonButton, IonRange,
    IonIcon,
    IonButtons
  ],
})
export class HomePage {

  MAX_STATIONS = 40;

  counties: County[] = COUNTIES;
  selectedCounties: string[] = [];
  fuelStations: Station[] = [];
  loading = false;
  fuelPrices: Record<string, FuelPrice> = {};

  coordinates: any = "";
  lat: number = 0;
  long: number = 0;
  radius: number = 10;

  constructor(
    private overpassService: OverpassService,
    private storage: Storage,
    private fuelPricesService: FuelPricesService,
    private router: Router) {
    addIcons({ locationOutline, informationCircleOutline });
  }

  async ionViewWillEnter() {
    console.log('HomePage ionViewWillEnter');
    await this.storage.create();
    this.selectedCounties = await this.storage.get('selectedCounties') || [];
    console.log('Loaded selected counties from storage:', this.selectedCounties);

    if (this.fuelStations.length === 0) {
      if (this.selectedCounties.length > 0) {
        this.loadStationsAndPrices();
      }
    } else {
      const optimisticPrice = await this.storage.get('optimisticPrice');
      if (optimisticPrice) {
        this.fuelPrices[optimisticPrice.stationId] = optimisticPrice;
        await this.storage.remove('optimisticPrice');
      }

      setTimeout(() => this.loadPrices(this.fuelStations), 3000);
    }
  }

  async getGPS() {
    this.coordinates = await Geolocation.getCurrentPosition();
    this.lat = this.coordinates.coords.latitude;
    this.long = this.coordinates.coords.longitude;
    console.log('Current position:', this.coordinates);
    this.loadStationsAndPrices(true);
  }

  onCountyChange() {
    this.loadStationsAndPrices();
    this.updateSelectedCounties();
  }

  async updateSelectedCounties() {
    await this.storage.create();
    await this.storage.set('selectedCounties', this.selectedCounties);
    console.log('Updated selected counties in storage:', this.selectedCounties);
  }

  private loadStationsAndPrices(nearMe: boolean = false) {
    if (!nearMe && this.selectedCounties.length === 0) return;

    this.loading = true;

    let observableStations: Observable<Station[]>;

    if (nearMe) {
      observableStations = this.overpassService.getStationsNearPosition(this.lat, this.long, this.radius);
    } else {
      observableStations = this.overpassService.getStationsByCounties(this.selectedCounties);
    }

    observableStations.subscribe({
      next: (stations) => {
        this.fuelStations = stations.slice(0, this.MAX_STATIONS);
        this.loading = false;
        console.log('Loaded stations:', stations);
        this.loadPrices(this.fuelStations);
      },
      error: (err) => {
        console.error('Overpass API error:', err);
        this.loading = false;
        this.loadFromJsonBlob();
      }
    });
  }

  private loadFromJsonBlob() {
    this.loading = true;
    this.overpassService.getStationsFromJsonBlob().subscribe({
      next: (stations) => {
        this.fuelStations = stations.slice(0, this.MAX_STATIONS);
        this.loading = false;
        console.log('Loaded stations from JSON blob:', stations);
      },
      error: (err) => {
        console.error('Error loading from JSON blob:', err);
        this.loading = false;
      }
    });
  }

  private loadPrices(stations: Station[]) {
    const ids = stations.map(s => String(s.id));
    this.fuelPricesService.getBatchPrices(ids).subscribe({
      next: (prices) => {
        this.fuelPrices = prices;
        console.log('Loaded fuel prices:', prices);
      },
      error: (err) => {
        console.error('Error loading prices:', err);
      }
    });
  }

  goToAbout() {
    this.router.navigate(['/about']);
  }
}