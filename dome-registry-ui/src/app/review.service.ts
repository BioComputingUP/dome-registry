import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Injectable } from '@angular/core';
import { BehaviorSubject, map, Observable, tap } from "rxjs";
import * as core from "dome-registry-core";


export type Field = 'publication.title' | 'publication.year' | 'publication.authors' | 'score'


export interface Sort {
  by: Field,
  asc: 'true' | 'false'
}


export interface Offset {
  skip: number,
  limit: number
}


export interface Query extends Offset, Sort {
  // Search parameters
  text: string;
  public: 'true' | 'false';
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


@Injectable({
  providedIn: 'root'
})
export class ReviewService {

  // Define APIs endpoint
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
  public getReview(uuid: string): Observable<Review> {
    // Make request against database
    return this.httpClient.get<Review>(this.url + '/' + uuid);
  }

  // Search for multiple reviews against database
  public searchReviews(query: Query) {
    // Define GET query parameters
    let params: any = { ...query, sort: query.by, by: undefined };
    // Return observable for search results
    return this.httpClient.get<Array<Review | { matches: Record<string, string> }>>(this.url, { params }).pipe(
      tap((reviews) => {
        console.log({ reviews })
      }),
      // Parse matching strings to matching text
      map((reviews) => reviews.map((review) => {
        // Define query text
        let text = query.text.toLowerCase();
        // Initialize map for matching occurrences
        let matches = new Map<string, Match>();
        // Check if something matches
        if (text && review.matches) {
          // Loop through each match in review
          for (let [key, value] of Object.entries(review.matches)) {
            // Match string in current field
            let start = value.toLowerCase().match(text)?.index;
            // Case string matches
            if (start) {
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
        // Parse field matches to text matches
        return { ...review, matches } as Review;
      })),
    );
  }


  // Delete a review from the database
  public deleteReview(uuid: string): Observable<void> {
    // Issue delete request to server
    return this.httpClient.delete<void>(this.url + '/' + uuid);
  }



  // Get the total number of the public entries 
  public countElements(): Observable<number> {
    return this.httpClient.get<number>(this.url + '/total').pipe(
      map(response => response as number)
    );
  }


  // Get the total number of the private entries 
  public countPrivElements(): Observable<number> {

    return this.httpClient.get<number>(this.url + '/totalPrivate')
  }

  public getOwner(uuid: string): Observable<string> {

    return this.httpClient.get<string>(this.url + '/adel/' + uuid);

  }

  // Create or update a review and insert it into the database
  public upsertReview(review: Partial<Review>): Observable<Review> {
    // Define endpoint URL according to review identifier
    let url = this.url + '/' + (review.uuid || '');
    // Define method according to review identifier
    return review.uuid ? this.httpClient.patch<Review>(url, review) : this.httpClient.post<Review>(url, review);
  }
  public publishAnnotation(uuid: any) {

    //(url, review) : this.httpClient.post<Review>(url, review)
    let url = this.url + '/publish/' + uuid;
    let update = {public: true}

    return this.httpClient.patch<Review>(url,{});
  }


}





