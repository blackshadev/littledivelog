import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DiveDetailComponent } from './components/dives/dive-detail/dive-detail.component';
import { DiveListComponent } from './components/dives/dive-list/dive-list.component';
import { DivesComponent } from './components/dives/dives.component';
import { DiveStore } from './services/dive.service';
import { NgModule } from '@angular/core';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { MenuComponent } from './components/menu/menu.component';
import { HideWhenMobileDirective } from './directives/hide-when/hide-when.directive';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { MyAutoCompletionDirective } from './directives/auto-complete/my-auto-completion.directive';
import { AutocompleteComponent } from './components/controls/autocomplete/autocomplete.component';
import { TagsComponent } from './components/controls/tags/tags.component';
import { TagsControlComponent } from './components/controls/tags-control/tags-control.component';

@NgModule({
  declarations: [
    AppComponent,
    DivesComponent,
    DiveListComponent,
    DiveDetailComponent,
    DashboardComponent,
    MenuComponent,
    HideWhenMobileDirective,
    MyAutoCompletionDirective,
    AutocompleteComponent,
    TagsComponent,
    TagsControlComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    Ng2AutoCompleteModule
  ],
  providers: [
    DiveStore
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
