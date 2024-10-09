import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable, of, retry} from 'rxjs';
import {WSData, WSResponse, WSSubscriptionMessage} from '../interfaces/ws-interfaces';
import {environment} from '../../environments/environment';
import {WS_MESSAGE_RETRY_COUNT, WS_MESSAGE_RETRY_DELAY, WS_SUBSCRIPTION_MESSAGE} from '../constants/ws-constants';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class WebsocketService {
  private socket: WebSocket | null = null;
  private messagesSubject = new BehaviorSubject<WSData | null>(null);
  private previousInstrumentId: string | null = null;

  isConnected(): boolean {
    return this.socket !== null && this.socket.readyState === WebSocket.OPEN;
  }

  connect(token: string): void {
    this.socket = new WebSocket(`${environment.wsUrl}?token=${token}`);

    this.socket.onopen = () => {
      console.log('WebSocket connection established');
    };

    this.socket.onmessage = (event: MessageEvent) => {
      const message: WSResponse = JSON.parse(event.data);
      this.messagesSubject.next(message.last);
    };

    this.socket.onclose = () => {
      console.log('WebSocket connection closed');
    };

    this.socket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log('WebSocket connection closed manually');
    }
  }

  getMessages(): Observable<WSData | null> {
    return this.messagesSubject.asObservable();
  }

  switchInstrument(instrumentId: string): void {
    if (this.previousInstrumentId) {
      this.sendMessage({
        ...WS_SUBSCRIPTION_MESSAGE,
        instrumentId: this.previousInstrumentId,
        subscribe: false
      });
    }

    this.sendMessage({
      ...WS_SUBSCRIPTION_MESSAGE,
      instrumentId: instrumentId,
      subscribe: true
    });

    this.previousInstrumentId = instrumentId;
  }

  private sendMessage(message: WSSubscriptionMessage): void {
    this.trySendMessage(message)
      .subscribe({
        next: () => console.log('Message sent successfully:', message),
        error: (err) => console.error('Failed to send message:', err),
      });
  }

  private trySendMessage(message: WSSubscriptionMessage): Observable<void> {
    return new Observable<void>((observer) => {
      const send = () => {
        if (this.socket && this.socket.readyState === WebSocket.OPEN) {
          this.socket.send(JSON.stringify(message));
          observer.complete();
        } else {
          observer.error('WebSocket not connected');
        }
      };

      send();

    }).pipe(
      retry({count: WS_MESSAGE_RETRY_COUNT, delay: WS_MESSAGE_RETRY_DELAY}),
      catchError(err => {
        console.error('Failed to send message after retries:', err);
        return of(err);
      })
    );
  }
}
