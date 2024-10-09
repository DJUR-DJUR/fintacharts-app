import {Component, inject, OnDestroy, OnInit, signal} from '@angular/core';
import {AuthService} from './services/auth.service';
import {DataService} from './services/data.service';
import {
  ChartDataResponse,
  ChartPoint,
  Instrument,
  InstrumentObject,
  InstrumentsResponse,
  PeriodicityEnum
} from './interfaces/data-interfaces';
import {SelectionComponent} from './components/selection/selection.component';
import {WebsocketService} from './services/websocket.service';
import {WSData} from './interfaces/ws-interfaces';
import {MatProgressSpinner} from '@angular/material/progress-spinner';
import {LiveDataComponent} from './components/live-data/live-data.component';
import {MatCard, MatCardContent, MatCardHeader, MatCardTitle} from '@angular/material/card';
import {HistoricalChartComponent} from './components/historical-chart/historical-chart.component';
import {ComponentDestroyedMixin} from './shared/component-destroed-mixin';
import {takeUntil} from 'rxjs';
import {TitleCasePipe} from '@angular/common';
import {MatMenu, MatMenuItem, MatMenuTrigger} from '@angular/material/menu';
import {MatButton} from '@angular/material/button';

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
    TitleCasePipe,
    MatMenu,
    MatMenuItem,
    MatButton,
    MatMenuTrigger,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent extends ComponentDestroyedMixin implements OnInit, OnDestroy {
  instrumentsList = signal<Instrument[]>([]);
  selectedInstrument = signal<Instrument | null>(null);
  chartPointsList = signal<ChartPoint[]>([]);
  loading = signal(false);
  error = signal(false);
  price = signal<number>(0);
  time = signal<string>('');
  periodicity = signal<PeriodicityEnum>(PeriodicityEnum.Day);

  private readonly authService = inject(AuthService);
  private readonly dataService = inject(DataService);
  private readonly webSocketService = inject(WebsocketService);

  get periodicityValues(): PeriodicityEnum[] {
    return Object.values(PeriodicityEnum);
  }

  ngOnInit(): void {
    void this.loadData();

    this.webSocketService.getMessages()
      .pipe(takeUntil(this.destroy$))
      .subscribe((data: WSData | null) => {
        this.price.set(data?.price ?? 0);
        this.time.set(data?.timestamp ?? '');
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
      void this.loadChartData(item.id);
    }
  }

  updatePeriodicity(value: PeriodicityEnum): void {
    this.periodicity.set(value);
    void this.loadChartData();
  }

  private async loadChartData(instrumentId = this.selectedInstrument()?.id ?? ''): Promise<void> {
    const res: ChartDataResponse | null = await this.dataService.getChartData(instrumentId, this.periodicity());

    if (res && res.data) {
      this.chartPointsList.set(res.data);
      this.loading.set(false);
    } else {
      this.handleError();
    }
  }

  private async LoadInstruments(): Promise<void> {
    const res: InstrumentsResponse | null = await this.dataService.getInstruments();

    if (res && res.data) {
      const instruments: Instrument[] = res.data.map((instrumentObject: InstrumentObject) => ({
        id: instrumentObject.id,
        description: instrumentObject.description,
        currency: instrumentObject.currency,
      }));

      this.instrumentsList.set(instruments);
      void this.onSelect(this.instrumentsList()[0]);
    } else {
      this.handleError();
    }
  }

  private handleError(): void {
    this.error.set(true);
    this.loading.set(false);
    this.instrumentsList.set([]);
    this.chartPointsList.set([]);
    this.webSocketService.disconnect();
  }

  override ngOnDestroy(): void {
    super.ngOnDestroy();
    this.webSocketService.disconnect();
  }
}
