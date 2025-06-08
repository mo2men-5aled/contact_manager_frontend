import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login';
import { ContactDashboardPage } from './pages/dashboard/dashboard';
import { AuthGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: ContactDashboardPage, canActivate: [AuthGuard] },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' },
];
