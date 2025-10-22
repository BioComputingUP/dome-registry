import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';
import { CardTemplateComponent } from '../card-template/card-template.component';

@Component({
  selector: 'card-nav',
  templateUrl: './card-nav.component.html',
  styleUrls: ['./card-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  standalone: true,
  imports: [CardTemplateComponent],
})
export class CardNavComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
