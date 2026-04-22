import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonItem, IonLabel, IonSelect, IonSelectOption,
  IonSpinner
} from '@ionic/angular/standalone';
import { Storage } from '@ionic/storage-angular';

import { COUNTIES, County } from '../shared/counties';
import { OverpassService } from '../services/overpass-service';
import { Station } from '../models/station.model';
import { StationCardComponent } from '../components/station-card/station-card.component';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [
    CommonModule, FormsModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonItem, IonLabel, IonSelect, IonSelectOption,
    IonSpinner, StationCardComponent
  ],
})
export class HomePage {
  counties: County[] = COUNTIES;
  selectedCounties: string[] = [];
  results: Station[] = [];
  loading = false;

  constructor(private overpassService: OverpassService, private storage: Storage) {}

  async ionViewWillEnter() {
    console.log('HomePage ionViewWillEnter');
    await this.storage.create();
    this.selectedCounties = await this.storage.get('selectedCounties') || [];
    console.log('Loaded selected counties from storage:', this.selectedCounties);
    this.loadData();
  }

  onCountyChange() {
    this.loadData();
    this.updateSelectedCounties();
  }

  async updateSelectedCounties() {
    await this.storage.create();
    await this.storage.set('selectedCounties', this.selectedCounties);
    console.log('Updated selected counties in storage:', this.selectedCounties);
  }

  private loadData() {
    if (this.selectedCounties.length === 0) return;

    this.loading = true;

    this.loadFromJsonBlob();
    return;
    this.overpassService.getStationsByCounties(this.selectedCounties).subscribe({
      next: (stations) => {
        this.results = stations;
        this.loading = false;
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
        this.results = stations;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading from JSON blob:', err);
        this.loading = false;
      }
    });
  }
}