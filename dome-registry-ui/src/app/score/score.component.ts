import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-score',
  templateUrl: './score.component.html',
  styleUrls: ['./score.component.scss'],
  standalone: true,
})
export class ScoreComponent implements OnInit {
  @Input() dataScore: number = 0;

  constructor() { }

  ngOnInit(): void {
  }

  // Calculate normalized score (divide by 21 and format to 2 decimal places)
  getNormalizedScore(): number {
    return parseFloat((this.dataScore / 21 ).toFixed(2));
  }
}
