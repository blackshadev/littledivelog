import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProfileService, IProfile } from 'app/services/profile.service';
import { randomInt } from 'app/shared/common';

const welcomeMessages = [
    'Ready to log some more?',
    'Happy logging',
    'Tried uploading your dive computer logs with our <a href="/uploader">uploader</a> tool?',
    'Do you have improvement suggestions? Contact me!',
    'Live, dive, log, repeat.',
];

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
    public profile: IProfile;
    public welcomeText: string;

    constructor(private profileService: ProfileService) {
        const int = randomInt(welcomeMessages.length - 1);
        this.welcomeText = welcomeMessages[int];
    }

    ngOnInit(): void {
        this.refresh();
    }

    refresh() {
        this.profileService.get().then(p => (this.profile = p));
    }
}
