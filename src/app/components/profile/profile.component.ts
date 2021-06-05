import { Component, OnInit } from "@angular/core";
import {
    ProfileService,
    IProfile,
    IEquipment,
} from "app/services/profile.service";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { markFormGroupTouched } from "app/shared/common";
import { CustomValidators } from "app/shared/validators";
import { ITank } from "app/shared/dive";

const DEFAULT_TANK: ITank = {
    volume: null,
    oxygen: 21,
    pressure: {
        begin: null,
        end: null,
        type: "bar",
    },
};

@Component({
    selector: "app-profile",
    templateUrl: "./profile.component.html",
    styleUrls: ["./profile.component.scss"],
})
export class ProfileComponent implements OnInit {
    public user: IProfile;
    public equipment: IEquipment;

    public passwordForm: FormGroup;
    public profileForm: FormGroup;
    public equipmentForm: FormGroup;

    public alertMessage:
        | {
              for: "profile" | "password" | "equipment";
              type: "error" | "success";
              text: string;
          }
        | undefined;

    public sessions: any[];

    constructor(private profileService: ProfileService, fb: FormBuilder) {
        this.passwordForm = fb.group(
            {
                currentPassword: ["", Validators.required],
                newPassword: ["", Validators.required],
                confirmNewPassword: ["", Validators.required],
            },
            {
                validator: CustomValidators.sameValue([
                    "newPassword",
                    "confirmNewPassword",
                ]),
            },
        );
        this.profileForm = fb.group({
            name: [""],
        });
        this.equipmentForm = fb.group({
            tank: fb.group({
                volume: ["", CustomValidators.integer],
                oxygen: ["", CustomValidators.integer],
                pressure: fb.group({
                    begin: ["", CustomValidators.decimal],
                    end: ["", CustomValidators.decimal],
                    type: ["bar", Validators.pattern(/bar|psi/)],
                }),
            }),
        });
    }

    public ngOnInit() {
        this.refresh();
        this.refreshSessions();
    }

    public async refresh() {
        this.user = await this.profileService.get();
        this.profileForm.setValue({
            name: this.user.name,
        });

        this.equipment = await this.profileService.equipment();
        if (this.equipment) {
            this.equipmentForm.setValue({
                tank: this.equipment.tanks[0] ?? DEFAULT_TANK,
            });
        }
    }

    public async refreshSessions() {
        this.sessions = await this.profileService.getSessions();
    }

    public async changeProfile() {
        markFormGroupTouched(this.profileForm);
        if (!this.profileForm.valid) {
            return;
        }

        try {
            await this.profileService.save({
                name: this.profileForm.controls.name.value,
            });
        } catch (err) {
            this.alertMessage = {
                for: "profile",
                type: "error",
                text: err.json().msg,
            };
            return;
        }
        this.alertMessage = {
            for: "profile",
            type: "success",
            text: "Profile changed",
        };
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
            this.alertMessage = {
                for: "password",
                type: "error",
                text: err.json().msg,
            };
            return;
        }
        this.alertMessage = {
            for: "password",
            type: "success",
            text: "Password changed",
        };
    }

    public async changeEquipment() {
        markFormGroupTouched(this.equipmentForm);
        if (!this.equipmentForm.valid) {
            return;
        }

        try {
            const val = this.equipmentForm.value;
            this.equipment = undefined;
            await this.profileService.changeEquipment({
                tanks: [val.tank],
            });
        } catch (err) {
            this.alertMessage = {
                for: "equipment",
                type: "error",
                text: err.json().msg,
            };
            return;
        }
        this.alertMessage = {
            for: "equipment",
            type: "success",
            text: "Equipment changed",
        };
    }

    public async deleteSession(token: string) {
        await this.profileService.deleteSession(token);
        this.refreshSessions();
    }
}
