import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {AuthService} from './auth.service';
import {ChartDataResponse, InstrumentsResponse} from '../interfaces/data-interfaces';
import {catchApiError} from '../utils/catch-api-error';
import {
  COUNT_BACK_BARS_COUNT,
  COUNT_BACK_INTERVAL, COUNT_BACK_PERIODICITY,
  COUNT_BACK_PROVIDER,
  INSTRUMENTS_KIND,
  INSTRUMENTS_PROVIDER
} from '../constants/data-constans';


@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly instrumentsUrl = `/api/instruments/v1/instruments`;
  private readonly countBachUrl = `/api/bars/v1/bars/count-back`;

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  async getInstruments(): Promise<InstrumentsResponse | null> {
    const token = await this.authService.getAccessToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('provider', INSTRUMENTS_PROVIDER)
      .set('kind', INSTRUMENTS_KIND);

    return await firstValueFrom(
      this.http.get<InstrumentsResponse>(this.instrumentsUrl, {headers, params})
        .pipe(catchApiError())
    );
  }

  async getChartData(id: string): Promise<ChartDataResponse | null> {
    const token = await this.authService.getAccessToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('instrumentId', id)
      .set('provider', COUNT_BACK_PROVIDER)
      .set('interval', COUNT_BACK_INTERVAL)
      .set('periodicity', COUNT_BACK_PERIODICITY)
      .set('barsCount', COUNT_BACK_BARS_COUNT);

    return await firstValueFrom(
      this.http.get<ChartDataResponse>(this.countBachUrl, {headers, params})
        .pipe(catchApiError())
    );
  }
}
