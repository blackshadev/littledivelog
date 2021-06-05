import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { AuthService } from "app/services/auth.service";
import { Router } from "@angular/router";

@Component({
    selector: "app-register",
    templateUrl: "./register.component.html",
    styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements OnInit {
    form: FormGroup;
    errorMsg: string;

    constructor(
        private fb: FormBuilder,
        private authService: AuthService,
        private router: Router,
    ) {
        this.form = fb.group(
            {
                email: [
                    "",
                    Validators.compose([Validators.required, Validators.email]),
                ],
                password: ["", Validators.required],
                confirmPassword: ["", Validators.required],
                name: ["", Validators.required],
            },
            {
                validator: (group: FormGroup) => {
                    const password = group.controls["password"];
                    const confirmPassword = group.controls["confirmPassword"];

                    if (password.value !== confirmPassword.value) {
                        return {
                            mismatchedPasswords: true,
                        };
                    }
                },
            },
        );
    }

    ngOnInit() {}

    async onSubmit() {
        if (!this.form.valid) {
            return;
        }

        this.errorMsg = undefined;

        await this.authService
            .register(this.form.value)
            .then(() =>
                this.router.navigate(["/login"], {
                    queryParams: { msg: "registered" },
                }),
            )
            .catch((err: Error) => {
                this.errorMsg = err.message;
            });
    }
}
