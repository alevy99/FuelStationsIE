import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FuelPrice {
  stationId: string;
  timestamp: string;
  petrol: number | null;
  diesel: number | null;
  petrolAvailable: boolean | null;
  dieselAvailable: boolean | null;
  priceLimit: number | null;
  litreLimit: number | null;
  reportCount: number;
}

export interface FuelPriceReport {
  stationId: string;
  petrol: number | null;
  diesel: number | null;
  petrolAvailable: boolean | null;
  dieselAvailable: boolean | null;
  priceLimit: number | null;
  litreLimit: number | null;
}

@Injectable({
  providedIn: 'root'
})
export class FuelPricesService {

  private readonly apiUrl = 'https://5ddab1s0rh.execute-api.eu-west-1.amazonaws.com';

  constructor(private http: HttpClient) { }

  getPrices(stationId: string): Observable<FuelPrice | null> {
    return this.http.get<FuelPrice | null>(`${this.apiUrl}/prices/${stationId}`);
  }

  reportPrice(report: FuelPriceReport): Observable<any> {
    return this.http.post(`${this.apiUrl}/prices`, report);
  }

  getBatchPrices(stationIds: string[]): Observable<Record<string, FuelPrice>> {
    console.log('Requesting batch prices for station IDs:', stationIds);
    return this.http.post<Record<string, FuelPrice>>(`${this.apiUrl}/prices/batch`, {
      stationIds
    });
  }
}