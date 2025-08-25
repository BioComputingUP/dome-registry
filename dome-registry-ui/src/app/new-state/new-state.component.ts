import {ChangeDetectionStrategy, Component, ElementRef, OnDestroy, OnInit, AfterViewInit, ViewChild} from '@angular/core';
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
  combineLatest,
  tap
} from "rxjs";

import {ActivatedRoute} from "@angular/router";
import {ReviewService, journalData} from '../review.service';
import {StatService}  from "../stat.service";
import {UserService} from '../user.service';
import * as d3 from 'd3';
// import "https://apicuron.org/assets/widgets/apicuron-leaderboard.js";
@Component({
  selector: 'app-new-state',
  templateUrl: './new-state.component.html',
  styleUrls: ['./new-state.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NewStateComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('pieChart', { static: false }) private pieChartElement!: ElementRef;
  @ViewChild('barChart', { static: false }) private barChartElement!: ElementRef;
  @ViewChild('scoresChart', { static: false }) private scoresChartElement!: ElementRef;
  @ViewChild('dbDistChart', { static: false }) private dbDistChartElement!: ElementRef;
  @ViewChild('optimizationChart', { static: false }) private optimizationChartElement!: ElementRef;
  @ViewChild('modelChart', { static: false }) private modelChartElement!: ElementRef;
  @ViewChild('evaluationChart', { static: false }) private evaluationChartElement!: ElementRef;

  private destroy$ = new Subject<boolean>();
  private progressBar: HTMLElement | null = null;
  private activeStep: number = 0;
  private svg: any;
  private pie: any;
  private arc: any;
  private hoverArc: any; // Arc generator for hover effect
  private outerArc: any;
  private colorScale: any;
  private chartData: {labels: string[], values: number[]} = {labels: [], values: []};
  private journalSubscription: any;

  // Bar chart properties
  private barSvg: any;
  private barTooltip: any;
  private barColorScale: any;
  private barData: {labels: string[], values: number[]} = {labels: [], values: []};
  private yearSubscription: any;

  // Scores bar chart properties
  private scoresSvg: any;
  private scoresTooltip: any;
  private scoresColorScale: any;
  private scoresData: {labels: string[], values: number[]} = {labels: [], values: []};
  private scoresSubscription: any;

  // Database distribution bar chart properties
  private dbDistSvg: any;
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
  chartOptions: any;
    constructor(
    private http: HttpClient,
    private activeRoute: ActivatedRoute,
    private elementRef: ElementRef,
    private statService: StatService,
    private userService: UserService,
    private reviewService:ReviewService
  ) {
  }

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
  // Statistics data
  public readonly userCount$: Observable<number> = this.userService.getTotalNumber().pipe(shareReplay(1));
  public readonly publicAnnotationsCount$: Observable<number> = this.reviewService.countElements().pipe(shareReplay(1));
  public readonly privateAnnotationsCount$: Observable<number> = this.reviewService.countPrivElements().pipe(shareReplay(1));
  public readonly totalAnnotationsCount$: Observable<number> = this.reviewService.countAllElements().pipe(shareReplay(1));

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

  // Retrieve paper per journal
  journal$ = combineLatest([this.journalsNames$, this.otherCount$]).pipe(
    map(([firstNine, otherCount]) => {
      // Prepare labels and values for the pie chart
      const labels = firstNine.map((journal) => journal._id);
      const values = firstNine.map((journal) => Number(journal.count));

      // Add "Other" category if there are remaining journals
      labels.push('Other');
      values.push(Number(otherCount));

      // Store the data for the D3 chart
      this.chartData = { labels, values };

      return { labels, values };
    }),
    // Create side effect to render the chart when data changes
    tap(() => {
      // Use setTimeout to ensure the DOM is ready
      setTimeout(() => this.renderPieChart(), 0);
    }),
    // Always return same data
    shareReplay(),
  );

  /**
   * Initializes the D3.js pie chart
   */
  private initPieChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.pieChartElement) return;

    const graphElement = this.pieChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.svg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '-400 -350 700 700') // Modified viewBox to center the chart horizontally
      .append('g');

    // Define color scale with modern colors
    this.colorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);

    // Create pie layout
    this.pie = d3.pie()
      .value((d: any) => d.value)
      .sort(null);

    // Create arc generators with larger radius for bigger pie chart
    const radius = 280; // Increased to match the radius used in renderPieChart
    this.arc = d3.arc()
      .innerRadius(0) // Fill the center of the pie chart
      .outerRadius(radius * 0.8);

    // Create hover arc generator with larger radius for hover effect
    this.hoverArc = d3.arc()
      .innerRadius(0) // Fill the center of the pie chart
      .outerRadius(radius * 0.9); // 10% larger than normal arc

    this.outerArc = d3.arc()
      .innerRadius(radius * 0.9)
      .outerRadius(radius * 0.9);
  }

  /**
   * Renders the D3.js pie chart with the current data
   */
  private renderPieChart(): void {
    if (!this.chartData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.svg) {
      this.initPieChart();
    }

    // Define radius for calculations
    const radius = 280; // Increased from 200 to make the chart bigger

    // Prepare the data for D3
    const data = this.chartData.labels.map((label, i) => ({
      label,
      value: this.chartData.values[i]
    }));

    // Generate pie slices
    const pieData = this.pie(data);

    // Create or update slices
    const slices = this.svg.selectAll('.pie-slice')
      .data(pieData);

    // Remove old slices
    slices.exit().remove();

    // Add new slices
    const newSlices = slices.enter()
      .append('g')
      .attr('class', 'pie-slice');

    // Add path for each slice
    newSlices.append('path')
      .merge(slices.select('path'))
      .attr('d', this.arc)
      .attr('fill', (d: any, i: number) => this.colorScale(i))
      .attr('stroke', 'none')
      .attr('stroke-width', 0)
      .style('transition', 'all 0.3s')
      // Add mouseover and mouseout events for hover effect
      .on('mouseover', (event: any, d: any) => {
        // Use the hoverArc to make the slice bigger
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', (datum: any) => this.hoverArc(datum));
      })
      .on('mouseout', (event: any, d: any) => {
        // Revert back to the regular arc
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('d', (datum: any) => this.arc(datum));
      });

    // Add labels with arrows around the pie chart
    const labelGroup = this.svg.selectAll('.label-group')
      .data(pieData);

    // Remove old labels
    labelGroup.exit().remove();

    // Create new label groups
    const newLabelGroup = labelGroup.enter()
      .append('g')
      .attr('class', 'label-group');

    // Merge existing and new label groups
    const allLabelGroups = newLabelGroup.merge(labelGroup);

    // Remove existing content from label groups
    allLabelGroups.selectAll('*').remove();

    // Add lines from slice to label
    allLabelGroups.append('polyline')
      .attr('points', (d: any) => {
        const pos = this.outerArc.centroid(d);
        const midAngle = this.midAngle(d);
        const x = Math.sin(midAngle) * (radius * 1.1);
        const y = -Math.cos(midAngle) * (radius * 1.1);
        return [this.arc.centroid(d), this.outerArc.centroid(d), [x, y]].join(' ');
      })
      .style('fill', 'none')
      .style('stroke', (d: any, i: number) => this.colorScale(i))
      .style('stroke-width', 2);

    // Add text labels
    allLabelGroups.append('text')
      .attr('dy', '.35em')
      .html((d: any) => {
        // Calculate percentage
        const percent = Math.round((d.data.value / d3.sum(data, (d: any) => d.value)) * 100);
        return `${d.data.label} ${percent}%`;
      })
      .attr('transform', (d: any) => {
        const pos = this.outerArc.centroid(d);
        const midAngle = this.midAngle(d);
        const x = Math.sin(midAngle) * (radius * 1.2);
        const y = -Math.cos(midAngle) * (radius * 1.2);
        const textAnchor = midAngle > Math.PI ? 'end' : 'start';
        return `translate(${x}, ${y}) rotate(0)`;
      })
      .style('text-anchor', (d: any) => {
        const midAngle = this.midAngle(d);
        return midAngle > Math.PI ? 'end' : 'start';
      })
      .style('fill', 'white')
      .style('font-size', '20px');
  }

  /**
   * Helper function to calculate the midpoint angle of a pie slice
   */
  private midAngle(d: any): number {
    return d.startAngle + (d.endAngle - d.startAngle) / 2;
  }

  /**
   * Helper function to calculate the offset for hovering effect
   */
  private calculateOffset(d: any): string {
    const offset = 10;
    const midangle = this.midAngle(d);
    const x = Math.sin(midangle) * offset;
    const y = -Math.cos(midangle) * offset;
    return `translate(${x},${y})`;
  }


  /**
   * Initializes the D3.js bar chart
   */
  private initBarChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.barChartElement) return;

    const graphElement = this.barChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.barSvg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Reduced viewBox for smaller bar chart
      .append('g')
      .attr('transform', 'translate(-55, 20)'); // Removed left margin to position chart at the leftmost

    // Create tooltip
    this.barTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'bar-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with modern colors similar to pie chart
    this.barColorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);
  }

  /**
   * Renders the D3.js bar chart with the current data
   */
  private renderBarChart(): void {
    if (!this.barData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.barSvg) {
      this.initBarChart();
    } else {
      // Clear existing content for redraw
      this.barSvg.selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.barData.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.barData.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.barSvg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this.barSvg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const data = this.barData.labels.map((label, i) => ({
      label,
      value: this.barData.values[i]
    }));

    // Add bars
    this.barSvg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this.barColorScale(i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this.barColorScale(data.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this.barColorScale(data.indexOf(d)));
      });

    // Add title
    this.barSvg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
  }

  /**
   * Initializes the D3.js scores bar chart
   */
  private initScoresBarChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.scoresChartElement) return;

    const graphElement = this.scoresChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.scoresSvg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Same viewBox as bar chart
      .append('g')
      .attr('transform', 'translate(-55, 20)'); // Removed left margin to position chart at the leftmost

    // Create tooltip
    this.scoresTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'scores-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with modern colors similar to pie chart
    this.scoresColorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);
  }

  /**
   * Renders the D3.js scores bar chart with the current data
   */
  private renderScoresBarChart(): void {
    if (!this.scoresData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.scoresSvg) {
      this.initScoresBarChart();
    } else {
      // Clear existing content for redraw
      this.scoresSvg.selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.scoresData.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.scoresData.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.scoresSvg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this.scoresSvg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const data = this.scoresData.labels.map((label, i) => ({
      label,
      value: this.scoresData.values[i]
    }));

    // Add bars
    this.scoresSvg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this.scoresColorScale(i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this.scoresColorScale(data.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this.scoresColorScale(data.indexOf(d)));
      });

    // Add title
    this.scoresSvg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
  }

  /**
   * Initializes the D3.js database distribution bar chart
   */
  private initDbDistBarChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.dbDistChartElement) return;

    const graphElement = this.dbDistChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.dbDistSvg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Same viewBox as bar chart
      .append('g')
      .attr('transform', 'translate(50, 20)'); // Removed left margin to position chart at the leftmost

    // Create tooltip
    this.dbDistTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'dbdist-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with modern colors similar to pie chart
    this.dbDistColorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);
  }

  /**
   * Initializes the D3.js optimization bar chart
   */
  private initOptimizationBarChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.optimizationChartElement) return;

    const graphElement = this.optimizationChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.optimizationSvg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Same viewBox as bar chart
      .append('g')
      .attr('transform', 'translate(50, 20)'); // Removed left margin to position chart at the leftmost

    // Create tooltip
    this.optimizationTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'optimization-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with modern colors similar to pie chart
    this.optimizationColorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);
  }

  /**
   * Initializes the D3.js model bar chart
   */
  private initModelBarChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.modelChartElement) return;

    const graphElement = this.modelChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.modelSvg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Same viewBox as bar chart
      .append('g')
      .attr('transform', 'translate(50, 20)'); // Removed left margin to position chart at the leftmost

    // Create tooltip
    this.modelTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'model-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with modern colors similar to pie chart
    this.modelColorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);
  }

  /**
   * Initializes the D3.js evaluation bar chart
   */
  private initEvaluationBarChart(): void {
    // Use ViewChild reference instead of querySelector
    if (!this.evaluationChartElement) return;

    const graphElement = this.evaluationChartElement.nativeElement;

    // Clear existing content
    d3.select(graphElement).selectAll('*').remove();

    // Create SVG element
    this.evaluationSvg = d3.select(graphElement)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', '0 0 600 400') // Same viewBox as bar chart
      .append('g')
      .attr('transform', 'translate(50, 20)'); // Removed left margin to position chart at the leftmost

    // Create tooltip
    this.evaluationTooltip = d3.select(graphElement)
      .append('div')
      .attr('class', 'evaluation-tooltip')
      .style('opacity', 0)
      .style('position', 'absolute')
      .style('pointer-events', 'none')
      .style('top', '10px')
      .style('left', '20%')
      .style('transform', 'translateX(0)')
      .style('z-index', '9999');

    // Define color scale with modern colors similar to pie chart
    this.evaluationColorScale = d3.scaleOrdinal()
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
        '#00B3B8'  // Periwinkle
      ]);
  }

  /**
   * Renders the D3.js database distribution bar chart with the current data
   */
  private renderDbDistBarChart(): void {
    if (!this.dbDistData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.dbDistSvg) {
      this.initDbDistBarChart();
    } else {
      // Clear existing content for redraw
      this.dbDistSvg.selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.dbDistData.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.dbDistData.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.dbDistSvg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this.dbDistSvg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const data = this.dbDistData.labels.map((label, i) => ({
      label,
      value: this.dbDistData.values[i]
    }));

    // Add bars
    this.dbDistSvg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this.dbDistColorScale(i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this.dbDistColorScale(data.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this.dbDistColorScale(data.indexOf(d)));
      });

    // Add title
    this.dbDistSvg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
  }

  /**
   * Renders the D3.js optimization bar chart with the current data
   */
  private renderOptimizationBarChart(): void {
    if (!this.optimizationData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.optimizationSvg) {
      this.initOptimizationBarChart();
    } else {
      // Clear existing content for redraw
      this.optimizationSvg.selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.optimizationData.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.optimizationData.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.optimizationSvg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this.optimizationSvg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const data = this.optimizationData.labels.map((label, i) => ({
      label,
      value: this.optimizationData.values[i]
    }));

    // Add bars
    this.optimizationSvg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this.optimizationColorScale(i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this.optimizationColorScale(data.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this.optimizationColorScale(data.indexOf(d)));
      });

    // Add title
    this.optimizationSvg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
  }

  /**
   * Renders the D3.js model bar chart with the current data
   */
  private renderModelBarChart(): void {
    if (!this.modelData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.modelSvg) {
      this.initModelBarChart();
    } else {
      // Clear existing content for redraw
      this.modelSvg.selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.modelData.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.modelData.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.modelSvg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this.modelSvg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const data = this.modelData.labels.map((label, i) => ({
      label,
      value: this.modelData.values[i]
    }));

    // Add bars
    this.modelSvg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this.modelColorScale(i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this.modelColorScale(data.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this.modelColorScale(data.indexOf(d)));
      });

    // Add title
    this.modelSvg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
  }

  /**
   * Renders the D3.js evaluation bar chart with the current data
   */
  private renderEvaluationBarChart(): void {
    if (!this.evaluationData.labels.length) return;

    // Initialize the chart if not already done
    if (!this.evaluationSvg) {
      this.initEvaluationBarChart();
    } else {
      // Clear existing content for redraw
      this.evaluationSvg.selectAll('*').remove();
    }

    const width = 500;
    const height = 300;

    // Create scales
    const xScale = d3.scaleBand()
      .domain(this.evaluationData.labels)
      .range([0, width])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([0, d3.max(this.evaluationData.values) || 0])
      .range([height, 0]);

    // Create axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    // Add X axis
    this.evaluationSvg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(xAxis)
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end')
      .style('fill', 'white');

    // Add Y axis
    this.evaluationSvg.append('g')
      .call(yAxis)
      .selectAll('text')
      .style('fill', 'white');

    // Prepare the data for D3
    const data = this.evaluationData.labels.map((label, i) => ({
      label,
      value: this.evaluationData.values[i]
    }));

    // Add bars
    this.evaluationSvg.selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (d: any) => xScale(d.label) || 0)
      .attr('y', (d: any) => yScale(d.value))
      .attr('width', xScale.bandwidth())
      .attr('height', (d: any) => height - yScale(d.value))
      .attr('fill', (d: any, i: number) => this.evaluationColorScale(i))
      .style('transition', 'all 0.3s')
      .on('mouseover', (event: any, d: any) => {
        // Highlight the bar on hover
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', d3.rgb(this.evaluationColorScale(data.indexOf(d))).brighter(0.5));
      })
      .on('mouseout', (event: any, d: any) => {
        // Restore original color
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', this.evaluationColorScale(data.indexOf(d)));
      });

    // Add title
    this.evaluationSvg.append('text')
      .attr('x', width / 2)
      .attr('y', -10)
      .attr('text-anchor', 'middle')
      .style('font-size', '14px')
      .style('fill', 'white')
  }

  // Retrieve paper per year
  ///year$ = this.reviewService.getAnnotationsYear().pipe(
  year$ = this.statService.getAnnotationsYear().pipe(
    // Define graph object to be returned
    map((year) => {
      const labels = year.map((year) => year._id).reverse();
      const values = year.map((year) => Number(year.count)).reverse();

      // Store the data for the D3 bar chart
      this.barData = { labels, values };

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
      setTimeout(() => this.renderBarChart(), 0);
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

      // Store the data for the D3 scores bar chart
      this.scoresData = { labels, values };

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
      setTimeout(() => this.renderScoresBarChart(), 0);
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

  // Retrieve database distribution
  dbDist$ = this.scoreDataset$.pipe(
    // Define graph object to be returned
    map((dataset) => {
      const labels = dataset.map((item) => item._id).reverse();
      const values = dataset.map((item) => Number(item.count)).reverse();

      // Store the data for the D3 database distribution bar chart
      this.dbDistData = { labels, values };

      // Define data
      let data = [
        // The chart bar for the database distribution
        {
          x: labels,
          y: values,
          type: 'bar',
        }];
      // Define layout
      let layout = {
        xaxis: {type: 'category', title: 'Database Score', tickangle: -45},
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
      setTimeout(() => this.renderDbDistBarChart(), 0);
    }),
    // Always return same data
    shareReplay(),
  );

  // Retrieve optimization distribution
  optimization$ = this.scoreOptimization$.pipe(
    // Define graph object to be returned
    map((dataset) => {
      const labels = dataset.map((item) => item._id).reverse();
      const values = dataset.map((item) => Number(item.count)).reverse();

      // Store the data for the D3 optimization bar chart
      this.optimizationData = { labels, values };

      // Define data
      let data = [
        // The chart bar for the optimization distribution
        {
          x: labels,
          y: values,
          type: 'bar',
        }];
      // Define layout
      let layout = {
        xaxis: {type: 'category', title: 'Optimization Score', tickangle: -45},
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
      setTimeout(() => this.renderOptimizationBarChart(), 0);
    }),
    // Always return same data
    shareReplay(),
  );

  // Retrieve model distribution
  model$ = this.scoreModel$.pipe(
    // Define graph object to be returned
    map((dataset) => {
      const labels = dataset.map((item) => item._id).reverse();
      const values = dataset.map((item) => Number(item.count)).reverse();

      // Store the data for the D3 model bar chart
      this.modelData = { labels, values };

      // Define data
      let data = [
        // The chart bar for the model distribution
        {
          x: labels,
          y: values,
          type: 'bar',
        }];
      // Define layout
      let layout = {
        xaxis: {type: 'category', title: 'Model Score', tickangle: -45},
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
      setTimeout(() => this.renderModelBarChart(), 0);
    }),
    // Always return same data
    shareReplay(),
  );

  // Retrieve evaluation distribution
  evaluation$ = this.scoreEvaluation$.pipe(
    // Define graph object to be returned
    map((dataset) => {
      const labels = dataset.map((item) => item._id).reverse();
      const values = dataset.map((item) => Number(item.count)).reverse();

      // Store the data for the D3 evaluation bar chart
      this.evaluationData = { labels, values };

      // Define data
      let data = [
        // The chart bar for the evaluation distribution
        {
          x: labels,
          y: values,
          type: 'bar',
        }];
      // Define layout
      let layout = {
        xaxis: {type: 'category', title: 'Evaluation Score', tickangle: -45},
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
      setTimeout(() => this.renderEvaluationBarChart(), 0);
    }),
    // Always return same data
    shareReplay(),
  );

  stats$ = forkJoin([this.journal$, this.year$, this.scores$, this.score$, this.dbDist$, this.optimization$, this.model$, this.evaluation$]).pipe(
    map(([journal, year, scores, score, dbDist, optimization, model, evaluation]) => ({journal, year, scores, score, dbDist, optimization, model, evaluation})),
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




  ngOnDestroy(): void {
    this.destroy$.next(true);

    // Unsubscribe from journal$ subscription to prevent memory leaks
    if (this.journalSubscription) {
      this.journalSubscription.unsubscribe();
    }

    // Unsubscribe from year$ subscription to prevent memory leaks
    if (this.yearSubscription) {
      this.yearSubscription.unsubscribe();
    }

    // Unsubscribe from scores$ subscription to prevent memory leaks
    if (this.scoresSubscription) {
      this.scoresSubscription.unsubscribe();
    }

    // Unsubscribe from dbDist$ subscription to prevent memory leaks
    if (this.dbDistSubscription) {
      this.dbDistSubscription.unsubscribe();
    }

    // Unsubscribe from optimization$ subscription to prevent memory leaks
    if (this.optimizationSubscription) {
      this.optimizationSubscription.unsubscribe();
    }

    // Unsubscribe from model$ subscription to prevent memory leaks
    if (this.modelSubscription) {
      this.modelSubscription.unsubscribe();
    }

    // Unsubscribe from evaluation$ subscription to prevent memory leaks
    if (this.evaluationSubscription) {
      this.evaluationSubscription.unsubscribe();
    }

    // Remove bar tooltip from DOM to prevent memory leaks
    if (this.barTooltip) {
      this.barTooltip.remove();
    }

    // Remove scores tooltip from DOM to prevent memory leaks
    if (this.scoresTooltip) {
      this.scoresTooltip.remove();
    }

    // Remove dbDist tooltip from DOM to prevent memory leaks
    if (this.dbDistTooltip) {
      this.dbDistTooltip.remove();
    }

    // Remove optimization tooltip from DOM to prevent memory leaks
    if (this.optimizationTooltip) {
      this.optimizationTooltip.remove();
    }

    // Remove model tooltip from DOM to prevent memory leaks
    if (this.modelTooltip) {
      this.modelTooltip.remove();
    }

    // Remove evaluation tooltip from DOM to prevent memory leaks
    if (this.evaluationTooltip) {
      this.evaluationTooltip.remove();
    }
  }

ngOnInit(): void {
    // Initialize the widget
    // Subscription to journal$ is handled in ngAfterViewInit
}

ngAfterViewInit(): void {
  this.progressBar = document.getElementById('vertical-scroll-progress');
  this.initializeStepperItems();
  this.initializeBoxClickEvents();

  // Initialize the pie chart if data is already available
  if (this.chartData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderPieChart(), 100);
  } else {
    // Force a subscription to journal$ to ensure data is loaded
    this.journalSubscription = this.journal$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderPieChart(), 100);
    });
  }

  // Initialize the bar chart if data is already available
  if (this.barData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderBarChart(), 100);
  } else {
    // Force a subscription to year$ to ensure data is loaded
    this.yearSubscription = this.year$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderBarChart(), 100);
    });
  }

  // Initialize the scores bar chart if data is already available
  if (this.scoresData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderScoresBarChart(), 100);
  } else {
    // Force a subscription to scores$ to ensure data is loaded
    this.scoresSubscription = this.scores$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderScoresBarChart(), 100);
    });
  }

  // Initialize the database distribution bar chart if data is already available
  if (this.dbDistData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderDbDistBarChart(), 100);
  } else {
    // Force a subscription to dbDist$ to ensure data is loaded
    this.dbDistSubscription = this.dbDist$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderDbDistBarChart(), 100);
    });
  }

  // Initialize the optimization bar chart if data is already available
  if (this.optimizationData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderOptimizationBarChart(), 100);
  } else {
    // Force a subscription to optimization$ to ensure data is loaded
    this.optimizationSubscription = this.optimization$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderOptimizationBarChart(), 100);
    });
  }

  // Initialize the model bar chart if data is already available
  if (this.modelData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderModelBarChart(), 100);
  } else {
    // Force a subscription to model$ to ensure data is loaded
    this.modelSubscription = this.model$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderModelBarChart(), 100);
    });
  }

  // Initialize the evaluation bar chart if data is already available
  if (this.evaluationData.labels.length > 0) {
    // Use a longer timeout to ensure the DOM is fully rendered
    setTimeout(() => this.renderEvaluationBarChart(), 100);
  } else {
    // Force a subscription to evaluation$ to ensure data is loaded
    this.evaluationSubscription = this.evaluation$.subscribe(() => {
      // Render the chart after data is loaded
      setTimeout(() => this.renderEvaluationBarChart(), 100);
    });
  }
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
