import {Component, inject, OnInit, signal} from '@angular/core';
import {AuthService} from './services/auth.service';
import {DataService} from './services/data.service';
import {Instrument, InstrumentObject, InstrumentsResponse} from './interfaces/data-interfaces';
import {SelectionComponent} from './components/selection/selection.component';
import {WebsocketService} from './services/websocket.service';
import {WSData} from './interfaces/ws-interfaces';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {LiveDataComponent} from './components/live-data/live-data.component';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {HistoricalChartComponent} from './components/historical-chart/historical-chart.component';
import {MatButton} from '@angular/material/button';
import {ComponentDestroyedMixin} from './shared/component-destroed-mixin';
import {takeUntil} from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    SelectionComponent,
    LiveDataComponent,
    HistoricalChartComponent,
    MatProgressSpinner,
    MatCard,
    MatCardContent,
    MatCardHeader,
    MatCardTitle,
    MatButton
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent extends ComponentDestroyedMixin implements OnInit {
  instrumentsList = signal<Instrument[]>([]);
  selectedInstrument = signal<Instrument | null>(null);
  loading = signal(false);
  error = signal(false);
  price = signal<number | null>(null);
  time = signal<string | null>(null);

  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);
  private readonly webSocketService = inject(WebsocketService);

  ngOnInit(): void {
    void this.loadData();

    this.webSocketService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: WSData | null) => {
        this.price.set(data ? data.price : null);
        this.time.set(data ? data.timestamp : null);
      });
  }

  async loadData(): Promise<void> {
    this.error.set(false);
    this.loading.set(true);

    const token = await this.authService.getAccessToken();

    if (token) {
      void this.LoadInstruments();

      if (!this.webSocketService.isConnected()) {
        this.webSocketService.connect(token);
      }
    } else {
      this.handleError();
    }
  }

  onSelect(item: Instrument | null): void {
    this.selectedInstrument.set(item);

    if (item) {
      this.webSocketService.switchInstrument(item.id);
    }
  }

  private async LoadInstruments(): Promise<void> {
    const res: InstrumentsResponse | null = await this.dataService.getInstruments();

    if (res && res.data) {
      const instruments: Instrument[] = res.data.map((instrumentObject: InstrumentObject) => ({
        id: instrumentObject.id,
        description: instrumentObject.description,
      }));

      this.instrumentsList.set(instruments);
      this.loading.set(false);
    } else {
      this.handleError();
    }
  }

  private handleError(): void {
    this.error.set(true);
    this.loading.set(false);
    this.instrumentsList.set([]);
    this.webSocketService.disconnect();
  }
}
