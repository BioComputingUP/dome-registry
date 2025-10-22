import { Component } from '@angular/core';
import { BigFooterComponent } from '../big-footer/big-footer.component';

@Component({
  selector: 'app-integrations-standards',
  templateUrl: './integrations-standards.component.html',
  styleUrls: ['./integrations-standards.component.scss'],
  standalone: true,
  imports: [
    BigFooterComponent,
  ],
})
export class IntegrationsStandardsComponent {
  constructor() {
    // Constructor logic if needed
  }
}
