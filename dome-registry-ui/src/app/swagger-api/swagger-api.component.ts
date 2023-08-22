import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';



declare const SwaggerUIBundle :any;
@Component({
  selector: 'app-swagger-api',
  templateUrl: './swagger-api.component.html',
  styleUrls: ['./swagger-api.component.scss']
})
export class SwaggerAPiComponent implements OnInit {

  constructor(private http:HttpClient) { }

  ngOnInit(): void {
    this.http.get('http://localhost:8118/api/#/')  // Adjust the URL
      .subscribe(
        (swaggerSpec: any) => {
          const swaggerUi = SwaggerUIBundle({
            spec: swaggerSpec,
            dom_id: '#swagger-ui-container'
          });
        },
        (error) => {
          console.error('Error fetching Swagger spec:', error);
        }
      );
  }


  
}
