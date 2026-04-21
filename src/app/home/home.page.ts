import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption } from '@ionic/angular/standalone';
import { COUNTIES, County } from '../shared/counties';
import { OverpassService } from '../services/overpass-service';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
  imports: [FormsModule, IonHeader, IonToolbar, IonTitle, IonContent, IonItem, IonLabel, IonSelect, IonSelectOption],
})
export class HomePage {

  counties: County[] = COUNTIES;
  selectedCounties: string[] = [];
  results: any[] = [];

  constructor(private overpassService: OverpassService) { }

  ngOnInit() {
    this.loadData();

  }

  onCountyChange() {
    // this.selectedCounties = event.detail.value;
    console.log('Chosen:', this.selectedCounties);
    this.loadData();
  }

  private loadData() {

    if (this.selectedCounties.length === 0) {
      return;
    }

    this.overpassService
      .getAmenitiesByCounties(this.selectedCounties)
      .subscribe({
        next: (response) => {
          console.log('Overpass response:', response);
          this.results = response.elements;
        },
        error: (err) => {
          console.error('Overpass error:', err);
        }
      });
  }

}
