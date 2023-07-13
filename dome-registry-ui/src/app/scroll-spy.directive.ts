import {
  AfterViewInit,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output
} from '@angular/core';
import {BehaviorSubject, ReplaySubject, Subscription} from "rxjs";
import {map} from "lodash";
import {ActivatedRoute} from "@angular/router";

@Directive({
  selector: '[scroll-spy]',
})
export class ScrollSpyDirective implements OnInit, AfterViewInit, OnDestroy {

  // Define root element, in which target must be searched
  @Input() root!: any;

  // Define root element of spied (scrollable) component
  get element() {
    return this.elementRef.nativeElement;
  }

  // Target (reference to element containing links)
  @Input() target!: string;

  // // Define a list of pointer links (fragment), pointed elements (id)
  // private spies!: Map<string, [any, any]>;

  // Define a map between id and link
  private links!: Map<string, any>;

  // Define previously active element
  private previous?: string;

  // Define subscription to fragment change
  private fragment_!: Subscription;

  constructor(
    // Dependency injection
    private activeRoute: ActivatedRoute,
    private elementRef: ElementRef
  ) {}

  // On input changes
  ngOnInit(): void {
    // Initialize spied
    this.links = new Map();
    // Define target elements (links with a valid "fragment" attribute)
    for (let link of this.root.querySelectorAll(`${this.target} a[fragment]`)) {
      // Define identifier
      let id = link.getAttribute('fragment');
      // // Define scrollable elements ("id" referenced by a "fragment")
      // let spied = id ? this.element.querySelector('#' + id) : undefined;
      // // Case both a link and an element exists
      // if (link && spied) {
      //   //  Store couple of link, element
      //   this.spies.set(id, [link, spied]);
      // }
      // TODO Case link has been set
      if (link) {
        // Then store it
        this.links.set(id, link);
      }
    }
  }

  ngAfterViewInit(): void {
    // Subscribe to fragment selection
    this.fragment_ = this.activeRoute.fragment
      // Then, handle fragment
      .subscribe((id) => {
        // Retrieve element by identifier
        let element = id ? this.element.querySelector('#' + id) : null;
        // Case fragment is set
        if (element) {
          // Scroll to element
          element.scrollIntoView({ behavior: "auto", block: "start", inline: "nearest" })
        }
        // Return nothing
        return void 0;
      });
  }

  // On destroy
  ngOnDestroy(): void {
    // Unsubscribe to page change
    this.fragment_.unsubscribe();
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any): void {

    // Define parent scroll (pixels)
    const scrollTop = event.target.scrollTop;
    // Define parent offset (pixels)
    const offsetTop = event.target.offsetTop;
    // Define identifier of current element
    let current: string | undefined = undefined;
    // Loop through each spied element
    for (let [id, link] of this.links) {
      // Substitute element with the ones in the page
      let element = document.getElementById(id)!;
      // Check if spied element is visible
      if (element && (element.offsetTop - offsetTop <= scrollTop)) {
        // Then, set current element as active
        current = id;
      }
    }

    // Case section has changed with respect to previous one
    if (current != this.previous) {
      // Retrieve previous element, if any
      let link = this.links.get(this.previous || '');
      // Remove .active class
      link && link.classList.remove('active');
      // Define current element
      link = this.links.get(current || '');
      // Add .active class
      link && link.classList.add('active');
      // Update previous element with current one
      this.previous = current;
    }
  }



}
