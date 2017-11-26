import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
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
import { HideWhenMobileDirective, HideWhenDesktopDirective } from './directives/hide-when/hide-when.directive';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { MyAutoCompletionDirective } from './directives/auto-complete/my-auto-completion.directive';
import { AutocompleteComponent } from './components/controls/autocomplete/autocomplete.component';
import { TagsComponent } from './components/controls/tags/tags.component';
import { TagsControlComponent } from './components/controls/tags-control/tags-control.component';
import { DiveProfileComponent } from './components/controls/dive-profile/dive-profile.component';
import { DivetimePipe } from './pipes/divetime.pipe';
import { LoginComponent } from './components/login/login.component';
import { ComputersComponent } from './components/computers/computers.component';
import { BuddiesComponent } from 'app/components/buddies/buddies.component';
import { TagComponent } from './components/controls/tags/tag/tag.component';
import { BuddyDetailComponent } from './components/buddies/buddy-detail/buddy-detail.component';
import { BuddyService } from 'app/services/buddy.service';
import { TagService } from 'app/services/tag.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { TagDetailComponent } from './components/tag-list/tag-detail/tag-detail.component';


@NgModule({
  declarations: [
    AppComponent,
    DivesComponent,
    DiveListComponent,
    DiveDetailComponent,
    DashboardComponent,
    MenuComponent,
    HideWhenMobileDirective,
    HideWhenDesktopDirective,
    MyAutoCompletionDirective,
    AutocompleteComponent,
    TagsComponent,
    TagsControlComponent,
    DiveProfileComponent,
    DivetimePipe,
    LoginComponent,
    ComputersComponent,
    BuddiesComponent,
    TagComponent,
    BuddyDetailComponent,
    TagListComponent,
    TagDetailComponent,
  ],
  imports: [
    BrowserModule,
    FormsModule,
    ReactiveFormsModule,
    HttpModule,
    AppRoutingModule,
    Ng2AutoCompleteModule,
    ColorPickerModule,
  ],
  providers: [
    DiveStore,
    BuddyService,
    TagService,
    AuthGuard,
    AuthService,
  ],
  bootstrap: [
    AppComponent
  ]
})
export class AppModule { }
