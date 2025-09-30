import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmitComponent } from '../submit/submit.component';
import { BigFooterComponent } from '../big-footer/big-footer.component';
import { RouterModule } from "@angular/router";
import { AsArrayPipe } from './as-array.pipe';

@NgModule({
  declarations: [SubmitComponent, BigFooterComponent, AsArrayPipe],
  imports: [CommonModule, RouterModule],
  exports: [SubmitComponent, BigFooterComponent, AsArrayPipe]
})
export class SharedModule {}
