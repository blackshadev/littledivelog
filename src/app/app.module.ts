import { AuthService } from "./services/auth.service";
import { AuthGuard } from "./guards/auth.guard";
import { AppRoutingModule } from "./app.routing";
import { AppComponent } from "./app.component";
import { DashboardComponent } from "./components/dashboard/dashboard.component";
import { DiveDetailComponent } from "./components/dives/dive-detail/dive-detail.component";
import { DivesComponent } from "./components/dives/dives.component";
import { DiveService } from "./services/dive.service";
import { NgModule, ErrorHandler } from "@angular/core";
import { ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BrowserModule } from "@angular/platform-browser";
import { MenuComponent } from "./components/menu/menu.component";
import { HideWhenDirective } from "./directives/hide-when/hide-when.directive";
import { NguiAutoCompleteModule } from "@ngui/auto-complete";
import { MyAutoCompletionDirective } from "./directives/auto-complete/my-auto-completion.directive";
import { AutocompleteComponent } from "./components/controls/autocomplete/autocomplete.component";
import { TagsComponent } from "./components/controls/tags/tags.component";
import { TagsControlComponent } from "./components/controls/tags-control/tags-control.component";
import { DiveProfileComponent } from "./components/dives/dive-profile/dive-profile.component";
import { DivetimePipe } from "./pipes/divetime.pipe";
import { LoginComponent } from "./components/login/login.component";
import { ComputersComponent } from "./components/computers/computers.component";
import { BuddiesComponent } from "app/components/buddies/buddies.component";
import { TagComponent } from "./components/controls/tags/tag/tag.component";
import { BuddyDetailComponent } from "./components/buddies/buddy-detail/buddy-detail.component";
import { BuddyService } from "app/services/buddy.service";
import { TagService } from "app/services/tag.service";
import { PlaceService } from "app/services/place.service";
import { ColorPickerModule } from "ngx-color-picker";
import { TagListComponent } from "./components/tag-list/tag-list.component";
import { TagDetailComponent } from "./components/tag-list/tag-detail/tag-detail.component";
import { RegisterComponent } from "./components/register/register.component";
import { HelpOnFocusDirective } from "./directives/help-on-focus/help-on-focus.directive";
import { GuestGuard } from "app/guards/guest.guard";
import { ProfileComponent } from "./components/profile/profile.component";
import { ProfileService } from "app/services/profile.service";
import { DownloadUploaderComponent } from "./components/download-uploader/download-uploader.component";
import { MiscService } from "app/services/misc.service";
import { ListDetailComponent } from "./components/controls/list-detail/list-detail.component";
import { DetailComponentComponent } from "./components/controls/detail-component/detail-component.component";
import { SearchComponent } from "./components/dives/search/search.component";
import { ValidateFunctionDirective } from "./directives/validate-function/validate-function.directive";
import { HTTP_INTERCEPTORS, HttpClientModule } from "@angular/common/http";
import { TokenInterceptor } from "./services/interceptors/token.interceptor";
import { BaseModalComponent } from "./components/modals/base/base-modal.component";
import { GlobalErrorHandler } from "./providers/GlobalErrorHandler.provider";
import { ErrorModalComponent } from "./components/modals/error/error-modal.component";
import { LocaldatetimePipe } from "./pipes/localdatetime.pipe";
import { ExternalLinkDirective } from "./directives/external-link/external-link.directive";
import { BrowserDetectorService } from "./services/browser-detector.service";

@NgModule({
    declarations: [
        AppComponent,
        DivesComponent,
        DiveDetailComponent,
        DashboardComponent,
        MenuComponent,
        HideWhenDirective,
        MyAutoCompletionDirective,
        AutocompleteComponent,
        TagComponent,
        TagsComponent,
        TagsControlComponent,
        DiveProfileComponent,
        DivetimePipe,
        LoginComponent,
        ComputersComponent,
        BuddiesComponent,
        BuddyDetailComponent,
        TagListComponent,
        TagDetailComponent,
        RegisterComponent,
        HelpOnFocusDirective,
        ProfileComponent,
        DownloadUploaderComponent,
        ListDetailComponent,
        DetailComponentComponent,
        SearchComponent,
        ValidateFunctionDirective,
        BaseModalComponent,
        ErrorModalComponent,
        LocaldatetimePipe,
        ExternalLinkDirective,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        ReactiveFormsModule,
        AppRoutingModule,
        NguiAutoCompleteModule,
        ColorPickerModule,
        HttpClientModule,
    ],
    providers: [
        {
            provide: ErrorHandler,
            useClass: GlobalErrorHandler,
        },
        DiveService,
        BuddyService,
        MiscService,
        TagService,
        AuthGuard,
        GuestGuard,
        PlaceService,
        ProfileService,
        AuthService,
        BrowserDetectorService,
        {
            provide: HTTP_INTERCEPTORS,
            useClass: TokenInterceptor,
            multi: true,
        },
    ],
    bootstrap: [AppComponent],
})
export class AppModule {}
