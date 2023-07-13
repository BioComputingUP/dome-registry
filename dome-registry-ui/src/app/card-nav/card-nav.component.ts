import {ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation} from '@angular/core';

@Component({
  selector: 'card-nav',
  templateUrl: './card-nav.component.html',
  styleUrls: ['./card-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CardNavComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
