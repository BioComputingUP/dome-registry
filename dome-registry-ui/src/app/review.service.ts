import {environment} from '../environments/environment';
import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {BehaviorSubject, map, Observable, shareReplay, tap} from 'rxjs';
import * as core from 'dome-registry-core';

export type Field =
  | 'publication.title'
  | 'publication.year'
  | 'publication.authors'
  | 'score'
  | 'created';

export interface Sort {
  by: Field;
  asc: 'true' | 'false';
}

export interface Offset {
  skip: number;
  limit: number;
}

export interface Query extends Offset, Sort {
  // Search parameters

  text: string;
  public: 'true' | 'false';
  filterCategory?: string;
}

export interface Match {
  match: string;
  prefix: string;
  suffix: string;
}

export interface Review extends core.Review {
  // Add matching fields
  matches?: Map<string, Match>;
  // Add pre-computed DOME score
  score?: number;
}

export interface journalData {
  _id: string;
  count: string
}

@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private jsonldMArkup: string;
  // Define APIs endpoint
  public readonly urlMarkup = environment.backend + '/markup';
  public readonly url = environment.backend + '/review';
  private dataSubject = new BehaviorSubject<string>('initial data');
  data$ = this.dataSubject.asObservable();

  // Dependency injection
  constructor(private readonly httpClient: HttpClient) {
  }

  // Set data for the shared services
  setData(data: string) {
    this.dataSubject.next(data);
  }

  // Get data for the shared service
  getData() {
    return this.dataSubject.getValue();
  }

  // Search for single review against database
  public getReview(shortid: string): Observable<Review> {
    // Make request against database
    return this.httpClient.get<Review>(this.url + '/' + shortid);
  }

  public upsertReview(review: Partial<Review>): Observable<Review> {
    if (!review.shortid) {
      throw new Error('shortid is required for updating the review');
    }
    // Define endpoint URL according to review identifier
    let url = this.url + '/' + (review.shortid || '');
    // Define method according to review identifier
    return this.httpClient.patch<Review>(url, review)
  }

  // Search for multiple reviews against database
  public searchReviews(query: Query) {
    // Define GET query parameters
    let params: any = {...query, sort: query.by, by: undefined, ...(query.filterCategory && query.filterCategory !== 'all' && {
        filter: query.filterCategory
      })};

    // Return observable for search results
    return this.httpClient
      .get<Array<Review | { matches: Record<string, string | string[]> }>>(this.url, {
        params,
      })
      .pipe(
        tap((reviews) => {
          console.log({reviews});
        }),
        // Parse matching strings to matching text
        map((reviews) =>
          reviews.map((review) => {
            // Define query text
            let text = query.text.toLowerCase();
            // Initialize map for matching occurrences
            let matches = new Map<string, Match>();

            // Check if something matches
            if (text && review.matches) {
              const fieldsToCheck = query.filterCategory && query.filterCategory !== 'all'
                ? [query.filterCategory]
                : Object.keys(review.matches);

              // Loop through each match in review
              for (let key of fieldsToCheck) {
                const value = review.matches[key];
                if (!value) continue;

                // Handle array fields (like tags)
                if (Array.isArray(value)) {
                  // For arrays, check if any element matches
                  const matchingElements = value.filter(item =>
                    item.toLowerCase().includes(text)
                  );

                  if (matchingElements.length > 0) {
                    matches.set(key, {
                      match: matchingElements.join(', '),
                      prefix: '',
                      suffix: ''
                    });
                  }
                }
                // Handle string fields
                else if (typeof value === 'string') {
                  // Match string in current field
                  const lowerValue = value.toLowerCase();
                  const start = lowerValue.indexOf(text);

                  // Case string matches
                  if (start >= 0) {
                    // Define end position of string match
                    let end = start + query.text.length;
                    // Define match
                    matches.set(key, {
                      match: value.slice(start, end),
                      prefix: value.slice(0, start),
                      suffix: value.slice(end, value.length),
                    });
                  }
                }
              }
            }

            // Parse field matches to text matches
            return {...review, matches} as Review;
          })
        )
      );
  }

  // Delete a review from the database
  public deleteReview(uuid: string): Observable<void> {
    // Issue delete request to server
    return this.httpClient.delete<void>(this.url + '/' + uuid);
  }

  // Get the total number of the public entries
  public countElements(): Observable<number> {
    return this.httpClient
      .get<number>(this.url + '/total')
      .pipe(map((response) => response as number));
  }

  // Get the total number of the private entries
  public countPrivElements(): Observable<number> {
    return this.httpClient.get<number>(this.url + '/totalPrivate');
  }

  public countAllElements(): Observable<number> {
    return this.httpClient.get<number>(this.url + '/totalpub');
  }

  // Create or update a review and insert it into the database
  public publishAnnotation(uuid: any) {
    //(url, review) : this.httpClient.post<Review>(url, review)
    let url = this.url + '/publish/' + uuid;
    let update = {public: true};

    return this.httpClient.patch<Review>(url, {});
  }

  public GetHomePageMarkup() {

    const url = this.urlMarkup + '/dataCatalog';
    return this.httpClient.get(url, {});
  }


  public GetSearchPageMarkup() {
    const url = this.urlMarkup + '/dataset';
    return this.httpClient.get(url, {});
  }


  public GetReviewMarkup(shortid: string) {
    const url = this.urlMarkup + '/' + shortid;

    return this.httpClient.get(url, {})
  }


  public FetchTenLatestReviews(): Observable<Review[]> {
    // Define endpoint URL
    const url = this.url + '/latest';
    // Make request against database
    return this.httpClient.get<Review[]>(url).pipe(
      tap((reviews) => {
        console.log({reviews});
      }),
      shareReplay(1)
    );
  }

  /**
   * Gets the ten latest reviews from the database
   * @returns An Observable of an array of Review objects
   */
  public getTenLatestReviews(): Observable<Review[]> {
    // Define endpoint URL
    const url = this.url + '/latest';
    // Make request against database
    return this.httpClient.get<Review[]>(url).pipe(
      shareReplay(1)
    );
  }

}
