import {ChangeDetectionStrategy, Component, ElementRef, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, forkJoin, map, Observable, of, shareReplay, switchMap, tap} from "rxjs";
import {ActivatedRoute} from "@angular/router";
import { Margin } from '@syncfusion/ej2-angular-charts';

@Component({
  selector: 'app-new-state',
  templateUrl: './new-state.component.html',
  styleUrls: ['./new-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  
  
})
export class NewStateComponent implements OnInit {
  databar: any;
  datadoughnut: any;
  dataline: any;
  datapolar: any;
  datapie:any;
  dataradar:any;
  datacombo: any;
  chartOptions: any;

  // Retrieve root element
  public get element() {
    return this.elementRef.nativeElement;
  }

  // Retrieve paper per journal
  journal$ = this.http.get<{
    journal: Record<string, string>,
    count: Record<string, number>,
  }>('./assets/data/stats/journal.json').pipe(
    // Return graph object
    map(({journal, count}) => {
      // Define plot data
      let data = [{
        
        type: 'pie',
        hole:.3,
        values: Object.values(count),
        labels: Object.values(journal),
        textinfo: "label+percent",
        textposition: "outside",
        insidetextorientation: 'trangential',
        textfont: {
          size: 12, // Adjust text size here
          color: 'black'
       },
       marker: {
        colors: [
          'rgb(255, 215, 0)',
          'rgb(128, 0, 128)', // Yellow
          'rgb(0, 128, 128)', // Purple
          'rgb(224, 176, 255)', // Blue
          'rgb (242, 195, 204)', // Orange
          'rgb(0, 128, 64)', // Red
          'rgb(15, 82, 186)', // Light Blue
          'rgb(187, 0, 51)', // Pink
          'rgb(0, 174, 179)', // Teal
          'rgb (192, 192, 192)' // Lavender
        ]
      },
      shadow: {
        color: 'rgba(0, 0, 0, 0.5)',
        size: 5,
        opacity: 0.5
      },
     
        automargin: true
      }];
      // Define plot layout
      let layout = {
        
        // Disable autosizing
        
        margin: { l: 0,
          r: 0,
          t: 0,
          b: 0},
        showlegend: false,
       
      };
      // Define configuration
      let config = {responsive: true, displayModeBar: false};
      // Return graph object
      return {data, layout, config};
    }),
    // Always return same data
    shareReplay(),
  );

  // Retrieve paper per year
  year$ = this.http.get<{
    year: Record<string, string>,
    pmid: Record<string, number>
  }>('assets/data/stats/year.json').pipe(
    // Define graph object to be returned
    map(({year, pmid}) => {
      // Define data
      let data = [
        // the scatter for the annotations
        {x: Object.values(year), 
          y: Object.values(pmid),
         type:'scatter',
        marker:{color:'red'}       },
      // The chart bar for the annotation 

          {x: Object.values(year), 
          y: Object.values(pmid),
          type: 'bar',
           
         
        }];
      // Define layout
      let layout = {
        
      
        xaxis: {  type: 'category ',title: 'Year', tickangle: -45 },
        yaxis: { title: 'Count' },
        // margin: {"l": 2, "r": 2},
        showlegend: false,
      };
      // Define configuration
      let config = {responsive: true, displayModeBar: false}
      // Return graph parameters
      return {data, layout, config};
    }),
    // Always return same data
    shareReplay(),
  );

  // // Retrieve paper per user (first 10)
  // user$ = this.http.get<{ user: Record<string, string>, pmid: Record<string, number> }>('assets/data/stats/user.json').pipe(
  //   // Define graph object to be returned
  //   map(({user, pmid}) => {
  //     // Define data
  //     let data = [{x: Object.values(user), y: Object.values(pmid), type: 'bar'}];
  //     // Define layout
  //     let layout = {title: 'Annotated paper per user'};
  //     // Return graph parameters
  //     return {data, layout};
  //   }),
  //   // Always return same data
  //   shareReplay(),
  // );

  // Retrieve score distribution (for each section)
  score$: Observable<Record<string, { data: any, layout: any, config: any }>> = of('assets/data/stats/score_{0}.json').pipe(
    // Get data for each section
    switchMap((url) => {
      // Define sections
      // const sections = ['publication', 'dataset', 'optimization', 'model', 'evaluation', 'total'];
      const sections = ['dataset', 'optimization', 'model', 'evaluation', 'total'];
      // Wait for every data to be fetched
      return forkJoin(sections.map((section) => {
        // Just return the HTTP response
        return this.http.get<any>(url.replace('{0}', section)).pipe(
          // Create graph out of given data
          map((score) => {
            // Define x, y values
            let [x, y] = [[...Object.keys(score)], [...Object.values(score)]];
            // Change x values (strings)
            x = x.map((s) => s.match(/(-?\d+)[\]\)]+$/)![1]);
            // Define data
            let data = [{x,y, type:'scatter', marker: {color: 'blue'}},{ x, y, type: 'bar'}];
            // Define layout
            let layout = {
              
              xaxis: { title: 'DOME score' },
              yaxis: { title: 'Count' },
              // margin: {"l": 0, "r": 0},
              showlegend: false,
            };
            // Define configuration
            let config = {responsive: true, displayModeBar: false}
            // Return graph parameters
            return {data, layout, config};
          }),
          // Define partial object
          map((graph) => ({ [section]: graph })),
        )
      }));
    }),
    // Create single object
    map((graphs) => Object.assign({}, ...graphs)),
    // Cache results
    shareReplay(),
  )

  // Load all statistics
  stats$ = forkJoin([this.journal$, this.year$, this.score$]).pipe(
    map(([journal, year, score]) => ({journal, year, score})),
    shareReplay(),
  );

  constructor(
    private http: HttpClient,
    private activeRoute: ActivatedRoute,
    private elementRef: ElementRef,
  ) {
  }

  ngOnInit(): void {

  }

}

