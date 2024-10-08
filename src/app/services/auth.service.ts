import {inject, Injectable} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import {firstValueFrom} from 'rxjs';
import {AuthResponse} from '../interfaces/auth-interfaces';
import {catchApiError} from '../utils/catch-api-error';
import {environment} from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly tokenUrl = `/identity/realms/${environment.realm}/protocol/openid-connect/token`;
  private readonly clientId = 'app-cli';
  private readonly username = environment.credentials.username;
  private readonly password = environment.credentials.password;
  private _accessToken: string | null = null;
  private _tokenExpiration: number | null = null;

  private readonly http = inject(HttpClient);

  async getAccessToken(): Promise<string | null> {
    if (this.isTokenExpired()) {
      await this.getToken();
    }
    return this._accessToken || localStorage.getItem('access_token');
  };

  private isTokenExpired(): boolean {
      return this.tokenExpiration ? Date.now() > this.tokenExpiration : true;
  }

  private get tokenExpiration(): number | null {
    const expirationFromStorage = localStorage.getItem('token_expiration');
    const expiration = expirationFromStorage ? Number(expirationFromStorage) : null;
    return this._tokenExpiration || expiration;
  }

  private async getToken(): Promise<void> {
    const body = new URLSearchParams();
    body.set('grant_type', 'password');
    body.set('client_id', this.clientId);
    body.set('username', this.username);
    body.set('password', this.password);

    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });

    const res: AuthResponse | null = await firstValueFrom(
      this.http.post<AuthResponse>(this.tokenUrl, body.toString(), {headers}).pipe(catchApiError())
    );

    res ? this.storeTokens(res) : this.clearTokens();
  };

  private storeTokens(response: AuthResponse): void {
    this._accessToken = response.access_token;
    this._tokenExpiration = Date.now() + response.expires_in * 1000;
    localStorage.setItem('access_token', this._accessToken);
    localStorage.setItem('token_expiration', this._tokenExpiration.toString());
  }

  private clearTokens(): void {
    this._accessToken = null;
    this._tokenExpiration = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiration');
  }
}
