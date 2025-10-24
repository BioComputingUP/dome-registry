import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NewStateComponent } from './new-state.component';
import { ReviewService } from '../review.service';
import { StatService } from '../stat.service';
import { PlotlyModule } from 'angular-plotly.js';
import { RouterModule } from '@angular/router';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, PlotlyModule, RouterModule, SharedModule, NewStateComponent],
  exports: [NewStateComponent],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class NewStateModule {}
