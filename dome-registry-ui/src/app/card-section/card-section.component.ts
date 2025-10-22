import {ChangeDetectionStrategy, Component, ElementRef, OnInit} from '@angular/core';
import {FormGroup} from "@angular/forms";
import {isValidField} from "dome-registry-core";
import { CardTemplateComponent } from '../card-template/card-template.component';

@Component({
  selector: 'card-section',
  templateUrl: './card-section.component.html',
  styleUrls: ['./card-section.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CardTemplateComponent],
})
export class CardSectionComponent implements OnInit {

  constructor(private elementRef: ElementRef) {}

  ngOnInit(): void {}

  public static getStatistics(form: FormGroup): { done: number, skip: number, score: number} {
    // Initialize counts
    let [done, skip] = [0, 0];
    // Define fields
    let fields = form.value;
    // Loop through each field
    for (let [name, value] of Object.entries(fields)) {
      // TODO Case value is not defined
      if (!isValidField(name, value)) skip = skip + 1;
      // Otherwise
      else done = done + 1;
    }
    // Return both counts and compute score
    return { done, skip, score: done / (done + skip)}
  }

}
