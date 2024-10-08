import {inject, Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {AuthService} from './auth.service';
import {InstrumentsResponse} from '../interfaces/data-interfaces';
import {catchApiError} from '../utils/catch-api-error';

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private readonly apiUrl = `/api/instruments/v1/instruments`;

  private readonly http = inject(HttpClient);
  private readonly authService = inject(AuthService);

  async getInstruments(): Promise<InstrumentsResponse | null> {
    const token = await this.authService.getAccessToken();

    const headers = new HttpHeaders({
      'Authorization': `Bearer ${token}`
    });

    const params = new HttpParams()
      .set('provider', 'oanda')
      .set('kind', 'forex');

    return await firstValueFrom(
      this.http.get<InstrumentsResponse>(this.apiUrl, {headers, params})
        .pipe(catchApiError())
    );
  }
}
