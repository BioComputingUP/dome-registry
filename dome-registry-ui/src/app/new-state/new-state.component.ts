import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild, CUSTOM_ELEMENTS_SCHEMA} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {
  forkJoin,
  map,
  Observable,
  of,
  shareReplay,
  switchMap,
  Subject,
  tap
} from "rxjs";

import {ActivatedRoute} from "@angular/router";
import {ReviewService, journalData} from '../review.service';
import {StatService}  from "../stat.service";
import {UserService} from '../user.service';
import { Meta, Title } from '@angular/platform-browser';
import * as d3 from 'd3';
import { CommonModule } from '@angular/common';
import { SubmitComponent } from '../submit/submit.component';
import { BigFooterComponent } from '../big-footer/big-footer.component';
@Component({
  selector: 'app-new-state',
  templateUrl: './new-state.component.html',
  styleUrls: ['./new-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    // Angular common directives and pipes (*ngIf, *ngFor, async, date, etc.)
    CommonModule,
    // Standalone components used in template
    SubmitComponent,
    BigFooterComponent,
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class NewStateComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('dbDistChart', { static: false }) private dbDistChartElement!: ElementRef;
  @ViewChild('optimizationChart', { static: false }) private optimizationChartElement!: ElementRef;
  @ViewChild('modelChart', { static: false }) private modelChartElement!: ElementRef;
  @ViewChild('evaluationChart', { static: false }) private evaluationChartElement!: ElementRef;
  @ViewChild('journalsChart', { static: false }) private journalsChartElement!: ElementRef;
  @ViewChild('papersChart', { static: false }) private papersChartElement!: ElementRef;
  @ViewChild('scoresChart', { static: false }) private scoresChartElement!: ElementRef;

  private destroy$ = new Subject<boolean>();
  private progressBar: HTMLElement | null = null;
  private activeStep: number = 0;

  private yearSubscription: any;

  // Database distribution bar chart properties
  private dbDistTooltip: any;
  private dbDistColorScale: any;
  private dbDistData: {labels: string[], values: number[]} = {labels: [], values: []};
  private dbDistSubscription: any;

  // Optimization bar chart properties
  private optimizationSvg: any;
  private optimizationTooltip: any;
  private optimizationColorScale: any;
  private optimizationData: {labels: string[], values: number[]} = {labels: [], values: []};
  private optimizationSubscription: any;

  // Model bar chart properties
  private modelSvg: any;
  private modelTooltip: any;
  private modelColorScale: any;
  private modelData: {labels: string[], values: number[]} = {labels: [], values: []};
  private modelSubscription: any;

  // Evaluation bar chart properties
  private evaluationSvg: any;
  private evaluationTooltip: any;
  private evaluationColorScale: any;
  private evaluationData: {labels: string[], values: number[]} = {labels: [], values: []};
  private evaluationSubscription: any;

  // Journals pie chart properties
  private journalsSvg: any;
  private journalsTooltip: any;
  private journalsColorScale: any;
  private journalsData: {labels: string[], values: number[]} = {labels: [], values: []};
  private journalsSubscription: any;

  // Papers bar chart properties
  private papersSvg: any;
  private papersTooltip: any;
  private papersColorScale: any;
  private papersData: {labels: string[], values: number[]} = {labels: [], values: []};
  private papersSubscription: any;

  // Scores bar chart properties
  private scoresSvg: any;
  private scoresTooltip: any;
  private scoresColorScale: any;
  private scoresData: {labels: string[], values: number[]} = {labels: [], values: []};
  private scoresSubscription: any;
  constructor(
    private http: HttpClient,
    private activeRoute: ActivatedRoute,
    private elementRef: ElementRef,
    private statService: StatService,
    private userService: UserService,
    private reviewService: ReviewService,
    private meta: Meta,
    private title: Title
  ) {
  }

  // Retrieve root element
  public get element() {
    return this.elementRef.nativeElement;
  }

  //gets Score dataset
  public readonly scoreDataset$: Observable<journalData[]> = this.statService.getScoreDataset().pipe(shareReplay(1));
  public readonly scoreOptimization$: Observable<journalData[]> = this.statService.getScoreOptimization().pipe(shareReplay(1));
  public readonly scoreEvaluation$: Observable<journalData[]> = this.statService.getScoreEvaluation().pipe(shareReplay(1));
  public readonly scoreModel$: Observable<journalData[]> = this.statService.getScoreModel().pipe(shareReplay(1));
  public readonly journalsNames$: Observable<journalData[]> = this.statService.getJournalsNames().pipe(shareReplay(1));

  // Process journal names data for the pie chart
  public readonly journals$ = this.journalsNames$.pipe(
    map(data => {
      // Sort by count (descending)
      const sortedAllData = [...data].sort((a, b) => Number(b.count) - Number(a.count));

      // Take the top 10 for main categories
      const sortedData = sortedAllData.slice(0, 10);

      // Calculate the sum of counts for journals not in the top 10
      const otherCount = sortedAllData.slice(10).reduce((sum, item) => sum + Number(item.count), 0);

      // Extract labels and values for the chart
      this.journalsData.labels = sortedData.map(item => item._id);
      this.journalsData.values = sortedData.map(item => Number(item.count));

      // Add "Another" category if there are more than 10 journals
      if (otherCount > 0) {
        this.journalsData.labels.push("Other");
        this.journalsData.values.push(otherCount);
      }

      return sortedData;
    }),
    shareReplay(1)
  );

  // Statistics data
  public readonly userCount$: Observable<number> = this.userService.getTotalNumber().pipe(shareReplay(1));
  public readonly publicAnnotationsCount$: Observable<number> = this.reviewService.countElements().pipe(shareReplay(1));
  public readonly privateAnnotationsCount$: Observable<number> = this.reviewService.countPrivElements().pipe(shareReplay(1));
  public readonly totalAnnotationsCount$: Observable<number> = this.reviewService.countAllElements().pipe(shareReplay(1));

  // We're using year$ for the papers chart data

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
        const y = data.map((item) => Number(item.count)).reverse(); // Assuming `count` is the value

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

  /**
   * Generic method to process chart data and create an Observable for bar charts
   * @param chartType The type of chart (e.g., 'dbDist', 'optimization')
   * @param dataSource$ The Observable data source
   * @param title The title for the chart's x-axis
   * @returns Observable with processed chart data
   */
  private createBarChartObservable(
    chartType: string,
    dataSource$: Observable<journalData[]>,
    title: string
  ): Observable<{data: any, layout: any, config: any}> {
    return dataSource$.pipe(
      // Process the data
      map((dataset) => {
        const labels = dataset.map((item) => item._id).reverse();
        const values = dataset.map((item) => Number(item.count)).reverse();

        // Store the data for the D3 chart
        this[`${chartType}Data`] = { labels, values };

        // Define data
        const data = [{
          x: labels,
          y: values,
          type: 'bar',
        }];

        // Define layout
        const layout = {
          xaxis: {type: 'category', title, tickangle: -45},
          yaxis: {title: 'Count'},
          showlegend: false,
        };

        // Define configuration
        const config = {responsive: true, displayModeBar: false};

        // Return graph parameters
        return {data, layout, config};
      }),

      // Create side effect to render the chart when data changes
      tap(() => {
        // Use setTimeout to ensure the DOM is ready
        setTimeout(() => this[`render${chartType.charAt(0).toUpperCase() + chartType.slice(1)}BarChart`](), 0);
      }),

      // Always return same data
      shareReplay(),
    );
  }

  /**
   * Common color palette for all charts
   */
  private chartColors = [
    '#1A5980', // Professional Blue
    '#FF8B55', // Mint Green
    '#B8E070', // Turquoise
    '#5EBDFF', // Indigo
    '#7B4CE2', // Royal Purple
    '#36D6A9', // Forest Green
    '#FF5E7A', // Lavender
    '#FFCC42', // Sky Blue
    '#8C52FF', // Ocean Blue
    '#00B3B8'  // Periwinkle
  ];

  /**
   * Generic method to initialize a D3.js bar chart
   * @param chartType The type of chart to initialize (e.g., 'dbDist', 'optimization')
   * @returns void
   */
  private initBarChart(chartType: string): void {
    // Get the chart element reference based on the chart type
    const chartElement = this[`${chartType}ChartElement`] as ElementRef;
    if (!chartElement) return;

    const graphElement = chartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this[`${chartType}Svg`] = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Same viewBox for all charts
      .append('g')
      .attr('transform', 'translate(50, 20)'); // Consistent positioning

    // Create tooltip
    this[`${chartType}Tooltip`] = d3.select(graphElement)
      .append('div')
      .attr('class', `${chartType.toLowerCase()}-tooltip`)
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with common colors
    this[`${chartType}ColorScale`] = d3.scaleOrdinal()
      .range(this.chartColors);
  }

  /**
   * Generic method to render a D3.js bar chart
   * @param chartType The type of chart to render (e.g., 'dbDist', 'optimization')
   * @returns void
   */
  private renderBarChart(chartType: string): void {
    const data = this[`${chartType}Data`];
    if (!data.labels.length) return;

    // Initialize the chart if not already done
    if (!this[`${chartType}Svg`]) {
      this.initBarChart(chartType);
    } else {
      // Clear existing content for redraw
      this[`${chartType}Svg`].selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(data.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(data.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this[`${chartType}Svg`].append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this[`${chartType}Svg`].append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const chartData = data.labels.map((label, i) => ({
      label,
      value: data.values[i]
    }));

    // Add bars
    this[`${chartType}Svg`].selectAll('.bar')
      .data(chartData)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this[`${chartType}ColorScale`](i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this[`${chartType}ColorScale`](chartData.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this[`${chartType}ColorScale`](chartData.indexOf(d)));
      });

    // Add title
    this[`${chartType}Svg`].append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white');
  }

  /**
   * Renders the D3.js database distribution bar chart with the current data
   */
  private renderDbDistBarChart(): void {
    this.renderBarChart('dbDist');
  }

  /**
   * Renders the D3.js optimization bar chart with the current data
   */
  private renderOptimizationBarChart(): void {
    this.renderBarChart('optimization');
  }

  /**
   * Renders the D3.js model bar chart with the current data
   */
  private renderModelBarChart(): void {
    this.renderBarChart('model');
  }

  /**
   * Renders the D3.js evaluation bar chart with the current data
   */
  private renderEvaluationBarChart(): void {
    this.renderBarChart('evaluation');
  }

  /**
   * Renders the D3.js papers bar chart with the current data
   */
  private renderPapersBarChart(): void {
    this.renderBarChart('papers');
  }

  /**
   * Renders the D3.js scores bar chart with the current data
   */
  private renderScoresBarChart(): void {
    this.renderBarChart('scores');
  }

  /**
   * Initializes the D3.js journals pie chart
   */
  private initJournalsPieChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.journalsChartElement) return;

    const graphElement = this.journalsChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    const svg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 700 500');

    // Create the main group for the pie chart
    this.journalsSvg = svg.append('g')
      .attr('transform', 'translate(350, 250)'); // Center the pie chart

    // Create tooltip
    this.journalsTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'journals-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('background-color', 'rgba(0, 0, 0, 0.7)')
      .style('color', 'white')
      .style('padding', '8px')
      .style('border-radius', '4px')
      .style('font-size', '12px')
      .style('z-index', '9999');

    // Define color scale with modern colors
    this.journalsColorScale = d3.scaleOrdinal()
      .range([
        '#1A5980', // Professional Blue
        '#FF8B55', // Mint Green
        '#B8E070', // Turquoise
        '#5EBDFF', // Indigo
        '#7B4CE2', // Royal Purple
        '#36D6A9', // Forest Green
        '#FF5E7A', // Lavender
        '#FFCC42', // Sky Blue
        '#8C52FF', // Ocean Blue
        '#00B3B8', // Periwinkle
        '#FF9900'  // Orange (for "Another" category)
      ]);
  }

  /**
   * Renders the D3.js journals pie chart with the current data
   */
  private renderJournalsPieChart(): void {
    if (!this.journalsData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.journalsSvg) {
      this.initJournalsPieChart();
    } else {
      // Clear existing content for redraw
      this.journalsSvg.selectAll('*').remove();
    }

    // Prepare the data for D3
    const data = this.journalsData.labels.map((label, i) => ({
      label,
      value: this.journalsData.values[i]
    }));

    // Create pie layout
    const pie = d3.pie<any>()
      .value((d: any) => d.value)
      .sort(null); // Don't sort, use the order provided

    // Create arc generator for pie slices
    const radius = Math.min(600, 400) / 2 - 40;
    const arc = d3.arc<any>()
      .innerRadius(0) // No inner radius for a filled pie (not a donut)
      .outerRadius(radius);

    // Create arc generator for label positioning
    const labelArc = d3.arc<any>()
      .innerRadius(radius * 0.8)
      .outerRadius(radius * 1.2);

    // Create pie slices
    const slices = this.journalsSvg.selectAll('.slice')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'slice');

    // Add colored paths for each slice
    slices.append('path')
      .attr('d', arc)
      .attr('fill', (d: any, i: number) => this.journalsColorScale(i))
      .style('stroke', 'none')
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Show tooltip
        // Calculate percentage for tooltip
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percentage = Math.round((d.data.value / total) * 100);
        this.journalsTooltip
          .style('opacity', 1)
          .html(`<strong>${d.data.label}</strong>: ${percentage}% (${d.data.value})`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 25) + 'px');

        // Highlight the slice
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1.05)');
      })
      .on('mouseout', (event: any) => {
        // Hide tooltip
        this.journalsTooltip
          .style('opacity', 0);

        // Restore original size
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('transform', 'scale(1)');
      });

    // Identify the two smallest slices by angle size
    const pieData = pie(data);
    const slicesBySize = [...pieData].sort((a, b) =>
      (a.endAngle - a.startAngle) - (b.endAngle - b.startAngle)
    );
    const twoSmallestIndices = slicesBySize.slice(0, 2).map(s => s.index);

    // Add connecting lines from slices to labels (except for the two smallest slices)
    slices.append('polyline')
      .filter((d: any) => !twoSmallestIndices.includes(d.index)) // Skip the two smallest slices
      .attr('points', (d: any) => {
        const pos = labelArc.centroid(d);
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        // Update end point to match new label position (shorter lines)
        const x1 = Math.sin(midAngle) * (radius + 30);
        const y1 = -Math.cos(midAngle) * (radius + 30);
        return [arc.centroid(d), pos, [x1, y1]].join(',');
      })
      .style('fill', 'none')
      .style('stroke', (d: any) => this.journalsColorScale(d.index))
      .style('stroke-width', '1.5px')
      .style('opacity', 0.8);

    // Add labels to the pie chart (except for the two smallest slices)
    slices.append('text')
      .filter((d: any) => !twoSmallestIndices.includes(d.index)) // Skip the two smallest slices
      .attr('transform', (d: any) => {
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        // Increase distance from pie chart
        const x = Math.sin(midAngle) * (radius + 40);
        const y = -Math.cos(midAngle) * (radius + 40);
        // Move the label outward
        return `translate(${x}, ${y})`;
      })
      .attr('text-anchor', (d: any) => {
        // Determine text-anchor based on position in the pie
        const midAngle = d.startAngle + (d.endAngle - d.startAngle) / 2;
        return midAngle < Math.PI ? 'start' : 'end';
      })
      .style('font-size', '12px')
      .style('fill', 'white')
      .style('font-weight', 'bold')
      .text((d: any) => {
        // Truncate long labels to ensure they fit
        const maxLength = 20; // Maximum characters for label
        let label = d.data.label;
        if (label.length > maxLength) {
          label = label.substring(0, maxLength - 3) + '...';
        }
        // Calculate percentage
        const total = data.reduce((sum, item) => sum + item.value, 0);
        const percentage = Math.round((d.data.value / total) * 100);
        return `${label} (${percentage}%)`;
      });

  }

  year$ = this.statService.getAnnotationsYear().pipe(
    // Define graph object to be returned
    map((year) => {
      const labels = year.map((year) => year._id).reverse();
      const values = year.map((year) => Number(year.count)).reverse();


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
    // Create side effect to render the chart when data changes
    tap(() => {
      // Use setTimeout to ensure the DOM is ready
    }),
    // Always return same data
    shareReplay(),
  );

  // Retrieve DOME score distribution
  scores$ = this.scoreOverall$.pipe(
    // Define graph object to be returned
    map((scores) => {
      const labels = scores.map((score) => score._id).reverse();
      const values = scores.map((score) => Number(score.count)).reverse();


      // Define data
      let data = [
        // the scatter for the scores
        {
          x: labels,
          y: values,
          type: 'scatter',
          marker: {color: 'red'}
        },
        // The chart bar for the scores
        {
          x: labels,
          y: values,
          type: 'bar',
        }];
      // Define layout
      let layout = {
        xaxis: {type: 'category', title: 'DOME Score Range', tickangle: -45},
        yaxis: {title: 'Count'},
        showlegend: false,
      };
      // Define configuration
      let config = {responsive: true, displayModeBar: false}
      // Return graph parameters
      return {data, layout, config};
    }),
    // Create side effect to render the chart when data changes
    tap(() => {
      // Use setTimeout to ensure the DOM is ready
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
              sectionData$ = this.scoreEvaluation$; // Replace it with the correct observable
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

  // Retrieve database distribution
  dbDist$ = this.createBarChartObservable('dbDist', this.scoreDataset$, 'Database Score');

  // Retrieve optimization distribution
  optimization$ = this.createBarChartObservable('optimization', this.scoreOptimization$, 'Optimization Score');

  // Retrieve model distribution
  model$ = this.createBarChartObservable('model', this.scoreModel$, 'Model Score');

  // Retrieve evaluation distribution
  evaluation$ = this.createBarChartObservable('evaluation', this.scoreEvaluation$, 'Evaluation Score');


  ngOnDestroy(): void {
    this.destroy$.next(true);


    // Unsubscribe from all subscriptions to prevent memory leaks
    this.unsubscribeIfExists('year');
    this.unsubscribeIfExists('scores');
    this.unsubscribeIfExists('dbDist');
    this.unsubscribeIfExists('optimization');
    this.unsubscribeIfExists('model');
    this.unsubscribeIfExists('evaluation');
    this.unsubscribeIfExists('journals');



    // Remove all tooltips from DOM to prevent memory leaks
    this.removeTooltip('dbDist');
    this.removeTooltip('optimization');
    this.removeTooltip('model');
    this.removeTooltip('evaluation');
    this.removeTooltip('journals');

    // Unsubscribe from papers data subscription
    this.unsubscribeIfExists('papers');
    this.removeTooltip('papers');

    // Unsubscribe from scores data subscription (already unsubscribed above)
    this.removeTooltip('scores');
  }

ngOnInit(): void {
  const pageTitle = 'Statistics and Dataset | DOME Registry';
  const description = 'Explore DOME Registry statistics: top annotated journals, curated papers per year, and distribution of DOME scores, with insights across data, optimization, model, and evaluation.';

  // Set page title
  this.title.setTitle(pageTitle);

  // Update meta description and social tags for this page
  this.meta.updateTag({ name: 'description', content: description });
  this.meta.updateTag({ property: 'og:title', content: pageTitle });
  this.meta.updateTag({ property: 'og:description', content: description });
  this.meta.updateTag({ name: 'twitter:card', content: 'summary' });
  this.meta.updateTag({ name: 'twitter:title', content: pageTitle });
  this.meta.updateTag({ name: 'twitter:description', content: description });
}

ngAfterViewInit(): void {
  this.progressBar = document.getElementById('vertical-scroll-progress');
  this.initializeStepperItems();
  this.initializeBoxClickEvents();



  // Force a subscription to scores$ to ensure data is loaded
  this.scoresSubscription = this.scores$.subscribe((scoresData) => {
    // Extract labels and values from scores data
    this.scoresData.labels = scoresData.data[0].x;
    this.scoresData.values = scoresData.data[0].y;

    // Render the chart after data is loaded
    setTimeout(() => this.renderScoresBarChart(), 100);
  });

  // Initialize all bar charts
  this.initializeBarChart('dbDist', this.dbDist$);
  this.initializeBarChart('optimization', this.optimization$);
  this.initializeBarChart('model', this.model$);
  this.initializeBarChart('evaluation', this.evaluation$);

  // Initialize the journals pie chart
  this.initializePieChart();

  // Initialize the papers bar chart with year$ data
  // Force a subscription to year$ to ensure data is loaded
  this.papersSubscription = this.year$.subscribe((yearData) => {
    // Extract labels and values from year data
    this.papersData.labels = yearData.data[0].x;
    this.papersData.values = yearData.data[0].y;

    // Render the chart after data is loaded
    setTimeout(() => this.renderPapersBarChart(), 100);
  });
}

private initializeStepperItems(): void {
  if (!this.progressBar) return;

  const contentItems = document.querySelectorAll('.progress-titles p');

  // Set initial progress bar height and active class
  this.updateProgressBar(0);
  this.setActiveItem(contentItems, 0);
  this.showActiveContent(0); // Show initial content

  // Add click event listeners to each content item
  contentItems.forEach((item, index) => {
    item.addEventListener('click', () => {
      this.activeStep = index;
      this.updateProgressBar(index);
      this.setActiveItem(contentItems, index);
      this.showActiveContent(index); // Show content for the clicked item
    });
  });
}

private setActiveItem(items: NodeListOf<Element>, activeIndex: number): void {
  // Remove active class from all items
  items.forEach(item => {
    item.classList.remove('active');
  });

  // Add active class to the selected item
  items[activeIndex].classList.add('active');
}

private updateProgressBar(stepIndex: number): void {
  if (!this.progressBar) return;

  // Use fixed percentages for each step (for vertical progress)
  const fixedPercentages = [20, 50, 100]; // Fixed percentages for each step
  const percentage = fixedPercentages[stepIndex];

  // Update height instead of width for vertical progress bar
  this.progressBar.style.height = `${percentage}%`;
}

private showActiveContent(activeIndex: number): void {
  // Get all content blocks
  const contentBlocks = document.querySelectorAll('.dynamic-content');

  // Remove active class from all content blocks
  contentBlocks.forEach((block) => {
    block.classList.remove('active');
  });

  // Immediately add active class to the selected content block
  contentBlocks[activeIndex].classList.add('active');
}

private initializeBoxClickEvents(): void {
  // Get all boxes
  const boxes = document.querySelectorAll('.score-distribution-boxes .box');

  // Add click event listeners to each box
  boxes.forEach((box, index) => {
    box.addEventListener('click', () => {
      this.setActiveBox(boxes, index);
    });
  });
}

private setActiveBox(boxes: NodeListOf<Element>, activeIndex: number): void {
  // Remove active class from all boxes
  boxes.forEach(box => {
    box.classList.remove('active');
  });

  // Add active class to the clicked box
  boxes[activeIndex].classList.add('active');

  // Update the score-dynamic content based on the active box
  this.showActiveScoreContent(activeIndex);
}

/**
 * Helper method to remove a tooltip from the DOM
 * @param tooltipType The type of tooltip to remove
 */
private removeTooltip(tooltipType: string): void {
  const tooltip = this[`${tooltipType}Tooltip`];
  if (tooltip) {
    tooltip.remove();
  }
}

/**
 * Helper method to unsubscribe from a subscription if it exists
 * @param subscriptionType The type of subscription to unsubscribe from
 */
private unsubscribeIfExists(subscriptionType: string): void {
  const subscription = this[`${subscriptionType}Subscription`];
  if (subscription) {
    subscription.unsubscribe();
  }
}

/**
 * Helper method to initialize a bar chart
 * @param chartType The type of chart to initialize (e.g., 'dbDist', 'optimization')
 * @param dataObservable$ The Observable that provides the chart data
 */
private initializeBarChart(chartType: string, dataObservable$: Observable<any>): void {
  // Check if data is already available
  if (this[`${chartType}Data`].labels.length > 0) {
    // Use a timeout to ensure the DOM is fully rendered
    setTimeout(() => this[`render${chartType.charAt(0).toUpperCase() + chartType.slice(1)}BarChart`](), 100);
  } else {
    // Force a subscription to ensure data is loaded
    this[`${chartType}Subscription`] = dataObservable$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this[`render${chartType.charAt(0).toUpperCase() + chartType.slice(1)}BarChart`](), 100);
    });
  }
}

/**
 * Helper method to initialize the journals pie chart
 */
private initializePieChart(): void {
  // Check if data is already available
  if (this.journalsData.labels.length > 0) {
    // Use a timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderJournalsPieChart(), 100);
  } else {
    // Force a subscription to journals$ to ensure data is loaded
    this.journalsSubscription = this.journals$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderJournalsPieChart(), 100);
    });
  }
}

private showActiveScoreContent(activeIndex: number): void {
  // Get all score content blocks
  const contentBlocks = document.querySelectorAll('.score-content-block');

  // Remove active class from all content blocks
  contentBlocks.forEach((block) => {
    block.classList.remove('active');
  });

  // Add active class to the selected content block
  contentBlocks[activeIndex].classList.add('active');

  // Render the appropriate chart based on the active index
  switch (activeIndex) {
    case 0:
      // Database chart
      setTimeout(() => this.renderDbDistBarChart(), 100);
      break;
    case 1:
      // Optimization chart
      setTimeout(() => this.renderOptimizationBarChart(), 100);
      break;
    case 2:
      // Model chart
      setTimeout(() => this.renderModelBarChart(), 100);
      break;
    case 3:
      // Evaluation chart
      setTimeout(() => this.renderEvaluationBarChart(), 100);
      break;
  }
}
}
