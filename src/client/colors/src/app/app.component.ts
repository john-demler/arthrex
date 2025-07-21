import { Component, OnInit, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { interval, Subscription } from 'rxjs';

interface QueueMessage {
  id: string;
  color: string;
  hex: string;
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Color Queue Display';
  
  messages: QueueMessage[] = [];
  isPolling = false;
  pollingSubscription?: Subscription;
  
  private readonly API_BASE_URL = 'http://localhost:4000/api';
  private readonly POLL_INTERVAL_MS = 2000;

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.startPolling();
  }

  ngOnDestroy() {
    this.stopPolling();
  }

  startPolling() {
    if (this.isPolling) return;
    
    this.isPolling = true;
    this.pollingSubscription = interval(this.POLL_INTERVAL_MS).subscribe(() => {
      this.fetchNextMessage();
    });
    
    // Fetch one immediately
    this.fetchNextMessage();
  }

  stopPolling() {
    this.isPolling = false;
    if (this.pollingSubscription) {
      this.pollingSubscription.unsubscribe();
      this.pollingSubscription = undefined;
    }
  }

  fetchNextMessage() {
    this.http.get<{ message: QueueMessage }>(`${this.API_BASE_URL}/item`)
      .subscribe({
        next: (response) => {
          const message = response.message;
          // Add to grid if not already present
          if (!this.messages.find(m => m.id === message.id)) {
            this.messages.push(message);
          }
        },
        error: (error) => {
          if (error.status !== 404) {
            console.error('Error fetching message:', error);
          }
          // 404 just means no messages available, which is fine
        }
      });
  }

  returnMessage(message: QueueMessage) {
    this.http.post(`${this.API_BASE_URL}/consume`, { id: message.id, consume: false })
      .subscribe({
        next: () => {
          // Remove from local grid
          this.messages = this.messages.filter(m => m.id !== message.id);
          console.log(`Returned message: ${message.color} (${message.id})`);
        },
        error: (error) => {
          console.error('Error returning message:', error);
        }
      });
  }

  clearGrid() {
    this.messages = [];
  }
}
