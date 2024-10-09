import {Component, input} from '@angular/core';
import {CurrencyPipe, DatePipe} from '@angular/common';
import {MatLabel} from '@angular/material/form-field';

@Component({
  selector: 'app-live-data',
  standalone: true,
  imports: [
    DatePipe,
    CurrencyPipe,
    MatLabel
  ],
  templateUrl: './live-data.component.html',
  styleUrl: './live-data.component.scss'
})
export class LiveDataComponent {
  symbol = input.required<string>();
  currency = input.required<string>();
  price = input.required<number>();
  time = input.required<string>();
}
