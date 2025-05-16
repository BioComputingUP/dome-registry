import { Injectable } from "@angular/core";
import { environment } from "../environments/environment";
import { HttpClient } from "@angular/common/http";
import { Observable, catchError } from "rxjs";
import { journalData } from "./review.service";

/**
 * Service for retrieving statistical data from the backend
 */
@Injectable({
  providedIn: 'root',
})
export class StatService {
  public readonly url = environment.backend + '/stat';

  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Helper method to fetch data from a specific endpoint
   * @param endpoint The endpoint to fetch data from
   * @returns Observable of journalData array
   */
  private fetchData(endpoint: string): Observable<journalData[]> {
    const url = `${this.url}/${endpoint}/`;
    return this.httpClient.get<journalData[]>(url)
      .pipe(
        catchError(error => {
          console.error(`Error fetching data from ${endpoint}:`, error);
          throw error;
        })
      );
  }

  /**
   * Get the journals names group
   * @returns Observable of journal names with counts
   */
  public getJournalsNames(): Observable<journalData[]> {
    return this.fetchData('totalJournalNames');
  }

  /**
   * Get annotations grouped by year
   * @returns Observable of annotations per year
   */
  public getAnnotationsYear(): Observable<journalData[]> {
    return this.fetchData('totalAnnotationsYear');
  }

  /**
   * Get the Dataset score statistics
   * @returns Observable of dataset scores
   */
  public getScoreDataset(): Observable<journalData[]> {
    return this.fetchData('totalScoreDataset');
  }

  /**
   * Get the Optimization score statistics
   * @returns Observable of optimization scores
   */
  public getScoreOptimization(): Observable<journalData[]> {
    return this.fetchData('totalScoreOptimization');
  }

  /**
   * Get the Evaluation score statistics
   * @returns Observable of evaluation scores
   */
  public getScoreEvaluation(): Observable<journalData[]> {
    return this.fetchData('totalScoreEvaluation');
  }

  /**
   * Get the Model score statistics
   * @returns Observable of model scores
   */
  public getScoreModel(): Observable<journalData[]> {
    return this.fetchData('totalScoreModel');
  }

  /**
   * Get the Overall score statistics
   * @returns Observable of overall scores
   */
  public getScoreOverall(): Observable<journalData[]> {
    return this.fetchData('totalScoreOverall');
  }
}
