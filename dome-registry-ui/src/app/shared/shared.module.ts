import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubmitComponent } from '../submit/submit.component';
import { BigFooterComponent } from '../big-footer/big-footer.component';
import {RouterModule} from "@angular/router";

@NgModule({
  declarations: [SubmitComponent, BigFooterComponent],
  imports: [CommonModule,RouterModule],
  exports: [SubmitComponent, BigFooterComponent]
})
export class SharedModule {}
