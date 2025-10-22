import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-big-footer',
  templateUrl: './big-footer.component.html',
  styleUrls: ['./big-footer.component.scss'],
  standalone: true,
  imports: [RouterLink],
})
export class BigFooterComponent implements OnInit {

  constructor() {
  }

  ngOnInit(): void {
  }
}
