import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  forkJoin,
  map,
  Observable,
  interval,
  take,
  of,
  shareReplay,
  switchMap,
  Subject,
  combineLatest
} from "rxjs";

import {ActivatedRoute} from "@angular/router";
import {ReviewService, journalData} from '../review.service';
import {StatService}  from "../stat.service";
import {UserService} from '../user.service';

@Component({
  selector: 'app-new-state',
  templateUrl: './new-state.component.html',
  styleUrls: ['./new-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,




})
export class NewStateComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<boolean>();
  databar: any;
  datadoughnut: any;
  dataline: any;
  datapolar: any;
  datapie: any;
  dataradar: any;
  datacombo: any;
  chartOptions: any;

  // Retrieve root element
  public get element() {
    return this.elementRef.nativeElement;
  }

  // gets only the top 9 journals names
  public readonly journalsNames$: Observable<journalData[]> = this.statService.getJournalsNames().pipe(map((Names) => Names.slice(0, 9)) // Limit to the first 9 items);
  );
  // Observable for the "Other" count
  public readonly otherCount$: Observable<number> = this.statService.getJournalsNames().pipe(
    map((groups) => {
      // Calculate the sum of counts for the first 9 journals
      const explicitCount = groups.slice(0, 9).reduce((total, Names) => total + Number(Names.count), 0);
      // Calculate the total count for all journals
      const totalCount = groups.reduce((total, Names) => total + Number(Names.count), 0);
      // Return the difference for the "Other" category
      return totalCount - explicitCount;
    })
  );
  //gets Score dataset
  public readonly scoreDataset$: Observable<journalData[]> = this.statService.getScoreDataset().pipe(shareReplay(1));
  public readonly scoreOptimization$: Observable<journalData[]> = this.statService.getScoreOptimization().pipe(shareReplay(1));
  public readonly scoreEvaluation$: Observable<journalData[]> = this.statService.getScoreEvaluation().pipe(shareReplay(1));
  public readonly scoreModel$: Observable<journalData[]> = this.statService.getScoreModel().pipe(shareReplay(1));
  public readonly scoreOverall$: Observable<journalData[]> = this.statService.getScoreOverall().pipe(
    map(data => {
      // Initialize an object to hold the summed values for each range
      const ranges = {
        '0-25': 0,
        '25-50': 0,
        '50-75': 0,
        '75-100': 0
      };

      // Iterate over the data and sum the values for each range
      data.forEach(item => {
        // Scale the ID to 0-100 (as you've already done)
        const scaledId = Math.round((Number(item._id) / 21) * 100);

        // Determine the range and add the value to the corresponding range
        if (scaledId >= 0 && scaledId < 25) {
          ranges['0-25'] += Number(item.count);
        } else if (scaledId >= 25 && scaledId < 50) {
          ranges['25-50'] += Number(item.count);
        } else if (scaledId >= 50 && scaledId < 75) {
          ranges['50-75'] += Number(item.count);
        } else if (scaledId >= 75 && scaledId <= 100) {
          ranges['75-100'] += Number(item.count);
        }
      });

      // Convert the summed ranges into an array of journalData objects
      const result: journalData[] = Object.entries(ranges).map(([range, value]) => ({
        _id: range, // Use the range as the ID
        count: value.toString() // Convert the value to a string and assign it to `count`
      }));

      return result.reverse();
    }),
    shareReplay(1)
  );


  private getSectionPlot(sectionName: string, sectionData$: Observable<journalData[]>): Observable<{
    data: any,
    layout: any,
    config: any
  }> {
    return sectionData$.pipe(
      map((data) => {
        // Extract x and y values from the data
        const x = data.map((item) => item._id).reverse(); // Assuming `_id` is the label (e.g., year or category)
        const y = data.map((item) => item.count).reverse(); // Assuming `count` is the value

        // Define data for the plot
        const plotData = [
          {x, y, type: 'scatter', marker: {color: 'blue'}}, // Scatter plot
          {x, y, type: 'bar'}, // Bar chart
        ];

        // Define layout for the plot
        const plotLayout = {
          xaxis: {type: 'category', title: sectionName}, // Dynamic title based on section
          yaxis: {title: 'Count'},
          showlegend: false,
        };

        // Define configuration for the plot
        const plotConfig = {responsive: true, displayModeBar: false};

        // Return the graph parameters
        return {data: plotData, layout: plotLayout, config: plotConfig};
      }),
    );
  }

  // Retrieve paper per journal
  journal$ = combineLatest([this.journalsNames$, this.otherCount$]).pipe(
    map(([firstNine, otherCount]) => {
      // Prepare labels and values for the pie chart
      const labels = firstNine.map((journal) => journal._id);
      const values = firstNine.map((journal) => journal.count);

      // Add "Other" category if there are remaining journals
      labels.push('Other');
      values.push(otherCount.toString());
      // Define plot data
      let data = [{


        type: 'pie',
        hole: .3,
        values: values,
        labels: labels,
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

        margin: {
          l: 0,
          r: 0,
          t: 0,
          b: 0
        },
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
  ///year$ = this.reviewService.getAnnotationsYear().pipe(
  year$ = this.statService.getAnnotationsYear().pipe(
    // Define graph object to be returned

    map((year) => {

      const labels = year.map((year) => year._id);
      const values = year.map((year) => year.count);
      // Define data
      let data = [
        // the scatter for the annotations
        {
          x: labels,
          y: values,
          type: 'scatter',
          marker: {color: 'red'}
        },
        // The chart bar for the annotation

        {
          x: labels,
          y: values,
          type: 'bar',




        }];
      // Define layout
      let layout = {


        xaxis: {type: 'category ', title: 'Year', tickangle: -45},
        yaxis: {title: 'Count'},
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

  // Retrieve score distribution (for each section)
  score$: Observable<Record<string, {
    data: any,
    layout: any,
    config: any
  }>> = of(['dataset', 'optimization', 'model', 'evaluation', 'total']).pipe(
    // SwitchMap to handle the array of sections
    switchMap((sections) => {
      // For each section, call the reusable function and get the plot data
      return forkJoin(
        sections.map((section) => {
          // Dynamically select the observable for the section
          let sectionData$: Observable<journalData[]>;
          switch (section) {
            case 'dataset':
              sectionData$ = this.scoreDataset$;
              break;
            case 'optimization':
              sectionData$ = this.scoreOptimization$;
              break;
            case 'model':
              sectionData$ = this.scoreModel$; // Replace with the correct observable
              break;
            case 'evaluation':
              sectionData$ = this.scoreEvaluation$; // Replace with the correct observable
              break;
            case 'total':
              sectionData$ = this.scoreOverall$; // Replace with the correct observable
              break;
            default:
              throw new Error(`Unknown section: ${section}`);
          }


          // Call the reusable function to get the plot data
          return this.getSectionPlot(section, sectionData$).pipe(
            // Map the result to include the section name
            map((graph) => ({[section]: graph})),
          );
        }),
      );
    }),
    // Combine all section plots into a single object
    map((graphs) => Object.assign({}, ...graphs)),
    // Cache the results
    shareReplay(1),
  );

  stats$ = forkJoin([this.journal$, this.year$, this.score$]).pipe(
    map(([journal, year, score]) => ({journal, year, score})),
    shareReplay(),
  );

  public readonly count$: Observable<number> = this.reviewService.countElements().pipe(shareReplay(1));
  public readonly countPr$: Observable<number> = this.reviewService.countPrivElements().pipe(shareReplay(1));
  public readonly countUsers$: Observable<number> = this.userService.getTotalNumber().pipe(shareReplay(1));
  public readonly countTotal$: Observable<number> = this.reviewService.countAllElements().pipe(shareReplay(1));
  // public readonly tot$ : Observable<number> = thiscount$ + this.countPr$

  // gets only the last 11 Annotations year
  public readonly journalsYear$: Observable<journalData[]> = this.statService.getAnnotationsYear().pipe(map((Names) => Names.slice(0, 11)) // Limit to the first 9 items);
  );


  public readonly countCounter$ = this.count$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter),
        take(count)
      )
    })
  )
  public readonly countPreson = this.countUsers$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter), take(count)
      )
    })
  )

  public readonly countProgres$ = this.countPr$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter), take(count)
      )
    })
  )

  public readonly countTotalE$ = this.countTotal$.pipe(
    switchMap((count: number) => {
      return interval(1).pipe(
        map((counter) => counter), take(count)
      )
    })
  )


  constructor(
    private http: HttpClient,
    private activeRoute: ActivatedRoute,
    private elementRef: ElementRef,
    private statService: StatService,
    private userService: UserService,
    private reviewService:ReviewService
  ) {
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
  }

  ngOnInit(): void {

  }

}

