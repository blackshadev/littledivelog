import { Component, OnInit } from '@angular/core';
import { ProfileService, IProfile } from 'app/services/profile.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { markFormGroupTouched } from 'app/shared/common';
import { CustomValidators } from 'app/shared/validators';

@Component({
    selector: 'app-profile',
    templateUrl: './profile.component.html',
    styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit {
    public user: IProfile;
    public passwordForm: FormGroup;
    public profileForm: FormGroup;

    public alertMessage: {
        for: 'profile'|'password',
        type: 'error'|'success',
        text: string
    }|undefined;


    constructor(
        private profileService: ProfileService,
        fb: FormBuilder,
    ) {
        this.passwordForm = fb.group({
            currentPassword: ['', Validators.required],
            newPassword: ['', Validators.required],
            confirmNewPassword: ['', Validators.required]
        }, {
            validator: CustomValidators.sameValue([
                'newPassword',
                'confirmNewPassword',
            ])
        });
        this.profileForm = fb.group({
            name: ['']
        });
    }

    public ngOnInit() {
        this.refresh();
    }

    public async refresh() {
        this.user = await this.profileService.get();
        this.profileForm.setValue({
            name: this.user.name,
        })
    }

    public async changeProfile() {
        markFormGroupTouched(this.profileForm);
        if (!this.profileForm.valid) {
            return;
        }

        try {
            await this.profileService.save({
                name: this.profileForm.controls.name.value
            });
        } catch (err) {
            this.alertMessage =  { for: 'profile' , type: 'error', text: err.json().msg } ;
            return;
        }
        this.alertMessage =  { for: 'profile' , type: 'success', text: 'Profile changed' } ;
    }

    public async changePassword() {
        markFormGroupTouched(this.passwordForm);
        if (!this.passwordForm.valid) {
            return;
        }

        try {
            await this.profileService.changePassword({
                old: this.passwordForm.controls.currentPassword.value,
                new: this.passwordForm.controls.newPassword.value,
            });
        } catch (err) {
            this.alertMessage =  { for: 'password' , type: 'error', text: err.json().msg } ;
            return;
        }
        this.alertMessage =  { for: 'password' , type: 'success', text: 'Password changed' } ;
    }

}
