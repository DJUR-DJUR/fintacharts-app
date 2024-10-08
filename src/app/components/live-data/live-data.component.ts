import {Component, input} from '@angular/core';
import {DatePipe} from '@angular/common';

@Component({
  selector: 'app-live-data',
  standalone: true,
  imports: [
    DatePipe
  ],
  templateUrl: './live-data.component.html',
  styleUrl: './live-data.component.scss'
})
export class LiveDataComponent {
  symbol = input.required<string | null>();
  price = input.required<number | null>();
  time = input.required<string | null>();
}
