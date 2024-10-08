import {Component, EventEmitter, input, OnInit, Output} from '@angular/core';
import {MatOption, MatSelect} from '@angular/material/select';
import {Instrument} from '../../interfaces/data-interfaces';
import {MatButton} from '@angular/material/button';

@Component({
  selector: 'app-selection',
  standalone: true,
  imports: [
    MatSelect,
    MatOption,
    MatButton
  ],
  templateUrl: './selection.component.html',
  styleUrl: './selection.component.scss'
})
export class SelectionComponent implements OnInit {
  instrumentsList = input.required<Instrument[]>();

  selected: Instrument | null = null;

  @Output()
  selectedInstrument = new EventEmitter<Instrument | null>();

  ngOnInit(): void {
    this.selected = this.instrumentsList()[0];
    this.selectedInstrument.next(this.selected);
  }

  onBtnClick(): void {
    this.selectedInstrument.next(this.selected);
  }
}
