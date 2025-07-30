import { Injectable, Inject } from '@angular/core';
import { Resolve, RouterStateSnapshot, ActivatedRouteSnapshot } from '@angular/router';
import { DOCUMENT } from '@angular/common';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // Automatically provides the service
})
export class WidgetResolverService implements Resolve<boolean> {

  constructor(@Inject(DOCUMENT) private document: Document) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    
    const widgetUrl = "https://apicuron.org/assets/widgets/apicuron-leaderboard.js";

    // Return a Promise that resolves when the script is loaded
    return new Promise((resolve, reject) => {
      // Check if the script is already loaded
      if (this.document.querySelector(`script[src="${widgetUrl}"]`)) {
        resolve(true);
        return;
      }

      const script = this.document.createElement('script');
      script.src = widgetUrl;
      script.async = true;
      script.defer = true;

      script.onload = () => {
        console.log('Widget script loaded successfully!');
        // You can initialize the widget here if needed
        resolve(true);
      };

      script.onerror = (error) => {
        console.error('Failed to load widget script:', error);
        reject(false); // On error, you can choose to reject and cancel navigation
      };

      this.document.body.appendChild(script);
    });
  }
}