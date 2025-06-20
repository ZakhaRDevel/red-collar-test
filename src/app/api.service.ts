import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map } from 'rxjs';

export interface ApiResponse {
  items: number[];
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'https://api.rand.by/v1/integer?count=1';

  fetchData(): Observable<ApiResponse> {
    return this.http.get<ApiResponse>(this.apiUrl);
  }

  createStreamWithDelay(
    streamNumber: number,
    data: Observable<ApiResponse>
  ): Observable<{ stream: number; data: ApiResponse }> {
    const delayTime = streamNumber * 500;
    return data.pipe(
      delay(delayTime),
      map((response) => ({ stream: streamNumber, data: response }))
    );
  }
}
