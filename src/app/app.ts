import { Component, signal } from '@angular/core';
import { ActivatedRoute, RouterOutlet } from '@angular/router';
import { Header, Footer, TreeRoot, Chat, CookiePanel } from './shared/components';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Footer, TreeRoot, Chat, CookiePanel],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class App {
  constructor(private activatedRoute: ActivatedRoute) {}

  protected readonly title = signal('Gyökereim');

  isComponent(component: string) {
    const route = this.activatedRoute.snapshot.firstChild?.routeConfig?.path;
    return component === route;
  }
}
