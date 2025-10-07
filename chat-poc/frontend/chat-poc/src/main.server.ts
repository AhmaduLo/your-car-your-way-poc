import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app';
import { provideRouter } from '@angular/router';

const bootstrap = () => bootstrapApplication(AppComponent, {
  providers: [
    provideRouter([])
  ]
});

export default bootstrap;
