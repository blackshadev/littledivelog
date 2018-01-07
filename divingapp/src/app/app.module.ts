import { AuthService } from './services/auth.service';
import { AuthGuard } from './guards/auth.guard';
import { AppRoutingModule } from './app.routing';
import { AppComponent } from './app.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { DiveDetailComponent } from './components/dives/dive-detail/dive-detail.component';
import { DivesComponent } from './components/dives/dives.component';
import { DiveService } from './services/dive.service';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { BrowserModule } from '@angular/platform-browser';
import { MenuComponent } from './components/menu/menu.component';
import { HideWhenMobileDirective, HideWhenDesktopDirective } from './directives/hide-when/hide-when.directive';
import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { MyAutoCompletionDirective } from './directives/auto-complete/my-auto-completion.directive';
import { AutocompleteComponent } from './components/controls/autocomplete/autocomplete.component';
import { TagsComponent } from './components/controls/tags/tags.component';
import { TagsControlComponent } from './components/controls/tags-control/tags-control.component';
import { DiveProfileComponent } from './components/dives/dive-profile/dive-profile.component';
import { DivetimePipe } from './pipes/divetime.pipe';
import { LoginComponent } from './components/login/login.component';
import { ComputersComponent } from './components/computers/computers.component';
import { BuddiesComponent } from 'app/components/buddies/buddies.component';
import { TagComponent } from './components/controls/tags/tag/tag.component';
import { BuddyDetailComponent } from './components/buddies/buddy-detail/buddy-detail.component';
import { BuddyService } from 'app/services/buddy.service';
import { TagService } from 'app/services/tag.service';
import { PlaceService } from 'app/services/place.service';
import { ColorPickerModule } from 'ngx-color-picker';
import { TagListComponent } from './components/tag-list/tag-list.component';
import { TagDetailComponent } from './components/tag-list/tag-detail/tag-detail.component';
import { RegisterComponent } from './components/register/register.component';
import { HelpOnFocusDirective } from './directives/help-on-focus/help-on-focus.directive';
import { GuestGuard } from 'app/guards/guest.guard';
import { ProfileComponent } from './components/profile/profile.component';
import { ProfileService } from 'app/services/profile.service';
import { DownloadUploaderComponent } from './components/download-uploader/download-uploader.component';
import { MiscService } from 'app/services/misc.service';
import { CommonHttp } from 'app/shared/http';
import { ListDetailComponent } from './components/controls/list-detail/list-detail.component';

@NgModule({
    declarations: [
        AppComponent,
        DivesComponent,
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
        RegisterComponent,
        HelpOnFocusDirective,
        ProfileComponent,
        DownloadUploaderComponent,
        ListDetailComponent,
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
        DiveService,
        BuddyService,
        MiscService,
        TagService,
        AuthGuard,
        GuestGuard,
        PlaceService,
        ProfileService,
        AuthService,
        CommonHttp,
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
