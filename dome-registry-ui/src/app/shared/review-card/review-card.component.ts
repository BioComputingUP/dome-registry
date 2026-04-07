import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AsArrayPipe } from '../as-array.pipe';
import { Review } from '../../review.service';

interface Score {
  done: number;
  skip: number;
  percentage?: number;
}

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    AsArrayPipe,
  ],
  templateUrl: './review-card.component.html',
  styleUrls: ['./review-card.component.scss'],
})
export class ReviewCardComponent {
  @Input() review!: Review;
  @Output() citeClicked = new EventEmitter<Review>();

  public getScorePercent(score: number): number {
    if (score == null || Number.isNaN(score)) return 0;
    const percent = score * 100;
    return Math.max(0, Math.min(100, percent));
  }

  public onCiteClick(): void {
    this.citeClicked.emit(this.review);
  }
}