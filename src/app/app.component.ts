import { Component, ChangeDetectionStrategy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, timer, Observable } from 'rxjs';
import { switchMap, startWith, map, share, mergeMap, filter } from 'rxjs';
import { ApiService, ApiResponse } from './api.service';

type StreamResult = {
  stream: number;
  data: ApiResponse;
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  constructor(private readonly apiService: ApiService) {}

  private readonly clickSubject = new Subject<number>();
  private readonly clickCounter = signal(0);

  private readonly apiCall$ = this.clickSubject.pipe(
    switchMap((clickId) =>
      this.apiService.fetchData().pipe(map((data) => ({ clickId, data })))
    ),
    share()
  );

  private readonly streamConfigs = [
    { number: 1, delay: 500 },
    { number: 2, delay: 1000 },
    { number: 3, delay: 1500 },
  ] as const;

  private createStream(
    streamNumber: number,
    delayMs: number
  ): Observable<StreamResult | null> {
    return this.apiCall$.pipe(
      mergeMap(({ clickId, data }) =>
        timer(delayMs).pipe(
          filter(() => clickId === this.clickCounter()),
          map(() => ({ stream: streamNumber, data }))
        )
      ),
      startWith(null)
    );
  }

  private readonly streams = this.streamConfigs.map((config) =>
    this.createStream(config.number, config.delay)
  );

  readonly stream1$ = this.streams[0];
  readonly stream2$ = this.streams[1];
  readonly stream3$ = this.streams[2];

  onButtonClick(): void {
    this.clickCounter.update((count) => count + 1);
    this.clickSubject.next(this.clickCounter());
  }
}
