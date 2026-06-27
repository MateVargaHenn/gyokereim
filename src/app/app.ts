import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header, Footer } from './shared/components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  protected readonly title = signal('Gyökereim');
}
