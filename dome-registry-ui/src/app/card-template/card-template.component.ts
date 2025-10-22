import {ChangeDetectionStrategy, Component, OnInit} from '@angular/core';

@Component({
  selector: 'card-template',
  templateUrl: './card-template.component.html',
  styleUrls: ['./card-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class CardTemplateComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
  }

}
