import {Component, effect, Input, input} from '@angular/core';
import {ChartPoint, PeriodicityEnum} from '../../interfaces/data-interfaces';
import {
  Chart,
  CategoryScale,
  LinearScale,
  LineController,
  LineElement,
  PointElement,
  Tooltip,
  Legend
} from 'chart.js';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-historical-chart',
  standalone: true,
  imports: [
    MatButton
  ],
  templateUrl: './historical-chart.component.html',
  styleUrl: './historical-chart.component.scss'
})
export class HistoricalChartComponent {
  chartPointsList = input.required<ChartPoint[]>();

  @Input()
  periodicity = PeriodicityEnum.Day;

  constructor() {
    effect(() => this.createChart());
  }

  chart: Chart | null = null;

  private createChart(): void {
    const labels: string[] = this.chartPointsList().map(point => {
      const date = new Date(point.t);

      if (this.periodicity === PeriodicityEnum.Minute || this.periodicity === PeriodicityEnum.Hour) {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      } else {
        return `${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getDate().toString().padStart(2, '0')}/${date.getFullYear()}`;
      }
    });

    const openPrices: number[] = this.chartPointsList().map(point => point.o);
    const highPrices: number[] = this.chartPointsList().map(point => point.h);
    const lowPrices: number[] = this.chartPointsList().map(point => point.l);
    const closePrices: number[] = this.chartPointsList().map(point => point.c);

    if (this.chart) {
      this.chart.destroy();
    }

    Chart.register(CategoryScale, LinearScale, LineController, LineElement, PointElement, Tooltip, Legend);

    this.chart = new Chart('myChart', {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: 'Open Price',
            data: openPrices,
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'High Price',
            data: highPrices,
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Low Price',
            data: lowPrices,
            borderColor: 'rgba(255, 206, 86, 1)',
            borderWidth: 2,
            fill: false,
          },
          {
            label: 'Close Price',
            data: closePrices,
            borderColor: 'rgba(54, 162, 235, 1)',
            borderWidth: 2,
            fill: false,
          },
        ],
      },
      options: {
        scales: {
          x: {
            type: 'category',
          },
          y: {
            type: 'linear',
          },
        },
      },
    });
  };
}
