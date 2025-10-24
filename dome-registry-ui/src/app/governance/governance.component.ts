import { Component } from '@angular/core';
import { BigFooterComponent } from '../big-footer/big-footer.component';

@Component({
  selector: 'app-governance',
  templateUrl: './governance.component.html',
  styleUrls: ['./governance.component.scss'],
  standalone: true,
  imports: [
    BigFooterComponent,
  ],
})
export class GovernanceComponent {
  constructor() {}
}
