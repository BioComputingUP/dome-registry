import { Component, OnInit } from '@angular/core';
import { CardTemplateComponent } from '../card-template/card-template.component';
import { BigFooterComponent } from '../big-footer/big-footer.component';

@Component({
  selector: 'app-dsw-card',
  templateUrl: './dsw-card.component.html',
  styleUrls: ['./dsw-card.component.scss'],
  standalone: true,
  imports: [
    CardTemplateComponent,
    BigFooterComponent,
  ],
})
export class DSWCardComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
