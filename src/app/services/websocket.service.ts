import { Injectable } from '@angular/core';
import {BehaviorSubject, Observable} from 'rxjs';
import {WSData, WSResponse} from '../interfaces/ws-interfaces';
import {environment} from '../../environments/environment';

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
      const unsubscribeMessage = {
        type: 'l1-subscription',
        id: '1',
        instrumentId: this.previousInstrumentId,
        provider: 'simulation',
        subscribe: false,
        kinds: ['last'],
      };

      this.sendMessage(unsubscribeMessage);
    }

    const subscribeMessage = {
      type: 'l1-subscription',
      id: '1',
      instrumentId: instrumentId,
      provider: 'simulation',
      subscribe: true,
      kinds: ['last'],
    };

    this.sendMessage(subscribeMessage);

    this.previousInstrumentId = instrumentId;
  }

  private sendMessage(message: object): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.socket.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }
}
