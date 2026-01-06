import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

interface ExchangeRateResponse {
  rates: { [key: string]: number };
  base: string;
  date: string;
}

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {
  // Using exchangerate-api.com (free tier: 1500 requests/month)
  private apiUrl = 'https://api.exchangerate-api.com/v4/latest';

  constructor(private http: HttpClient) {}

  // Fetch exchange rates for a base currency
  getExchangeRates(baseCurrency: string): Observable<ExchangeRateResponse> {
    return this.http.get<ExchangeRateResponse>(`${this.apiUrl}/${baseCurrency}`).pipe(
      catchError(error => {
        console.error('Error fetching exchange rates:', error);
        return of(null as any);
      })
    );
  }

  // Convert amount from one currency to another
  convertCurrency(
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ): Observable<number> {
    return this.getExchangeRates(fromCurrency).pipe(
      map(response => {
        if (!response || !response.rates[toCurrency]) {
          return 0;
        }
        return amount * response.rates[toCurrency];
      })
    );
  }
}
