import { Component } from '@angular/core';
import { ChatComponent } from "./components/chat.component";

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrls: ['./app.scss'],
  imports: [ChatComponent],
})
export class AppComponent {
  title = 'chat-poc';
}
