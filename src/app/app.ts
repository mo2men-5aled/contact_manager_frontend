import { NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NgIf, HeaderComponent],
  templateUrl: './app.html'
})
export class App {
  constructor(private router: Router) {}

  shouldShowHeader(): boolean {
    const hiddenRoutes = ['/login', '/register']; // add any other routes you want to exclude
    return !hiddenRoutes.includes(this.router.url);
  }

}
