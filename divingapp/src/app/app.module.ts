import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DiveDetailComponent } from './components/dives/dive-detail/dive-detail.component';
import { DiveListComponent } from './components/dives/dive-list/dive-list.component';
import { DivesComponent } from './components/dives/dives.component';
import { DiveService } from './services/dive.service';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { MenuComponent } from './components/menu/menu.component';
import { HideWhenMobileDirective } from './directives/hide-when.directive';


@NgModule({
  declarations: [
    AppComponent,
    DivesComponent,
    DiveListComponent,
    DiveDetailComponent,
    DashboardComponent,
    MenuComponent,
    HideWhenMobileDirective
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    AppRoutingModule
  ],
  providers: [
    DiveService
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
