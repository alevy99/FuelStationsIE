import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import {
  IonHeader, IonToolbar, IonTitle, IonContent,
  IonBackButton, IonButtons, IonBadge, IonItem,
  IonLabel, IonIcon, IonList
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { locationOutline, timeOutline, cardOutline, constructOutline } from 'ionicons/icons';
import { Station } from '../../models/station.model';
import { getBrandLogoURL } from 'src/app/shared/station-utils';

@Component({
  selector: 'app-station-detail',
  templateUrl: './station-detail.page.html',
  styleUrls: ['./station-detail.page.scss'],
  imports: [
    CommonModule,
    IonHeader, IonToolbar, IonTitle, IonContent,
    IonBackButton, IonButtons, IonBadge,
    IonItem, IonLabel, IonIcon, IonList
  ],
})
export class StationDetailPage implements OnInit {
  station!: Station;

  constructor(
    private router: Router,
    private route: ActivatedRoute) {
    addIcons({ locationOutline, timeOutline, cardOutline, constructOutline });
  }

  ngOnInit() {
    this.station = history.state?.station;

    if (!this.station) {
      console.warn('No station data in route state. Trying to load by ID from URL...');
      const id = this.route.snapshot.paramMap.get('id');

      if (id) {
        this.loadStationById(id);
      }
    }
  }

  private loadStationById(id: string) {
    console.warn('Load station by id is not implemented yet. ID:', id);
  }

  getLogoUrl(brand: string | null): string | null {
    return getBrandLogoURL(brand);
  }

  get coords(): string {
    return `${this.station.lat.toFixed(6)}, ${this.station.lon.toFixed(6)}`;
  }

  get mapsUrl(): string {
    return `https://www.google.com/maps/search/?api=1&query=${this.station.lat},${this.station.lon}`;
  }
}