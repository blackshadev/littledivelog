import { AuthGuard } from './guards/auth.guard';
import { DivesComponent } from './components/dives/dives.component';
import { DiveDetailComponent } from './components/dives/dive-detail/dive-detail.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LoginComponent } from './components/login/login.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes, PreloadAllModules } from '@angular/router';
import { ComputersComponent } from 'app/components/computers/computers.component';
import { BuddiesComponent } from 'app/components/buddies/buddies.component';
import { TagListComponent } from 'app/components/tag-list/tag-list.component';
import { RegisterComponent } from 'app/components/register/register.component';
import { GuestGuard } from 'app/guards/guest.guard';


const routes: Routes = [
    { path: '', redirectTo: '/dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
    { path: 'dive', component: DivesComponent, canActivate: [AuthGuard] },
    { path: 'computer', component: ComputersComponent, canActivate: [AuthGuard] },
    { path: 'buddy', component: BuddiesComponent, canActivate: [AuthGuard] },
    { path: 'buddy/:id', component: BuddiesComponent, canActivate: [AuthGuard] },
    { path: 'tag', component: TagListComponent, canActivate: [AuthGuard] },
    { path: 'tag/:id', component: TagListComponent, canActivate: [AuthGuard] },
    { path: 'dive/:id', component: DivesComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent, canActivate: [GuestGuard] },
    { path: 'register', component: RegisterComponent, canActivate: [GuestGuard] },
];
@NgModule({
    imports: [
        RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
    ],
    exports: [RouterModule],
})
export class AppRoutingModule { }
