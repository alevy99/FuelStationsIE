import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { COUNTIES } from '../shared/counties';
import { Station } from '../models/station.model';


@Injectable({
  providedIn: 'root',
})
export class OverpassService {

  private apiUrl = 'https://overpass-api.de/api/interpreter';

  private jsonBlobUrl = 'https://api.jsonblob.com/019db178-efd3-790d-bdba-384a272d7f23';

  constructor(private http: HttpClient) { }

  private buildQuery(
    selectedValues: string[],
    amenity: string = 'fuel'
  ): string {

    const selectedCounties = COUNTIES
      .filter(c => selectedValues.includes(c.value));

    const areaPart = selectedCounties
      .map(c =>
        `area["name"="${c.osmName}"]["admin_level"="6"]->.${c.value};`
      )
      .join('\n');

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

  private mapElement(el: any): Station | null {
    const t = el.tags ?? {};

    // Фильтруем: нет названия И нет бренда — пропускаем
    if (!t['name'] && !t['brand']) return null;

    // Фильтруем заброшенные
    if (t['abandoned:amenity'] === 'fuel') return null;

    const hasUnleaded =
      t['fuel:octane_95'] === 'yes' ||
      t['fuel:octane_98'] === 'yes' ||
      t['fuel:unleaded'] === 'yes' ||
      t['fuel:petrol'] === 'yes';

    const hasDiesel = t['fuel:diesel'] === 'yes';

    // Если явно указано что НЕТ ни одного топлива — пропускаем
    // (но если теги просто отсутствуют — оставляем, данные неполные)
    const fuelTagsPresent =
      'fuel:diesel' in t || 'fuel:octane_95' in t ||
      'fuel:octane_98' in t || 'fuel:unleaded' in t || 'fuel:petrol' in t;

    if (fuelTagsPresent && !hasUnleaded && !hasDiesel) return null;

    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;

    if (!lat || !lon) return null;

    return {
      id: el.id,
      lat,
      lon,
      name: t['name'] ?? t['brand'] ?? 'Fuel Station',
      brand: t['brand'] ?? null,
      address: t['addr:street'] ?? null,
      city: t['addr:city'] ?? null,
      openingHours: t['opening_hours'] ?? null,
      hasUnleaded,
      hasDiesel,
      hasCompressedAir: t['compressed_air'] === 'yes',
      wheelchair: t['wheelchair'] === 'yes',
      selfService: t['self_service'] === 'yes' ? true
        : t['self_service'] === 'no' ? false : null,
      payment: {
        cash: t['payment:cash'] === 'yes' ? true
          : t['payment:cash'] === 'no' ? false : null,
        creditCards: t['payment:credit_cards'] === 'yes' ? true
          : t['payment:credit_cards'] === 'no' ? false : null,
        debitCards: t['payment:debit_cards'] === 'yes' ? true
          : t['payment:debit_cards'] === 'no' ? false : null,
      },
      website: t['website'] ?? t['brand:website'] ?? null,
      operator: t['operator'] ?? null,
    };
  }

  getStationsByCounties(counties: string[]): Observable<any> {
    const query = this.buildQuery(counties);
    console.log('Query:', query);

    return this.http.post<any>(this.apiUrl, query, {
      headers: { 'Content-Type': 'text/plain' }
    }).pipe(
      map(res =>
        (res.elements as any[])
          .map(el => this.mapElement(el))
          .filter((s): s is Station => s !== null)
      )
    );
  }

  getStationsFromJsonBlob() {
    return this.http.get<any>(this.jsonBlobUrl).pipe(
      map(res =>
        (res.elements as any[])
          .map(el => this.mapElement(el))
          .filter((s): s is Station => s !== null)
      )
    );
  }


}
