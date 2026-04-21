import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { COUNTIES } from '../shared/counties';


@Injectable({
  providedIn: 'root',
})
export class OverpassService {

  private apiUrl = 'https://overpass-api.de/api/interpreter';

  constructor(private http: HttpClient) { }

  private buildQuery(
    selectedValues: string[],
    amenity: string = 'fuel'
  ): string {

    const selectedCounties = COUNTIES
      .filter(c => selectedValues.includes(c.value));

    // Build area declarations
    const areaPart = selectedCounties
      .map(c =>
        `area["name"="${c.osmName}"]["admin_level"="6"]->.${c.value};`
      )
      .join('\n');

    // Build nwr queries
    const nwrPart = selectedCounties
      .map(c =>
        `nwr["amenity"="${amenity}"](area.${c.value});`
      )
      .join('\n');

    return `
[out:json][timeout:25];
(
${areaPart}

${nwrPart}
);
out center;
`;
  }

  private capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  getAmenitiesByCounties(counties: string[]): Observable<any> {

    const query = this.buildQuery(counties);

    console.log('Query:', query);

    return this.http.post(
      this.apiUrl,
      query,
      {
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
  }


}
