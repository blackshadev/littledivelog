import { TestBed, inject, waitForAsync } from "@angular/core/testing";
import { GuestGuard } from "./guest.guard";
import { RouterStateSnapshot, Router } from "@angular/router";
import { AuthService } from "../services/auth.service";

describe("GuestGuard", () => {
    let guestGuard: GuestGuard;
    let authService = {
        isLoggedIn: false,
    };
    const router = {
        navigate: jasmine.createSpy("navigate"),
    };
    let mockSnapshot: RouterStateSnapshot;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                GuestGuard,
                { provide: AuthService, useValue: authService },
                { provide: Router, useValue: router },
            ],
        });
        mockSnapshot = jasmine.createSpyObj<RouterStateSnapshot>(
            "RouterStateSnapshot",
            ["toString"],
        );

        mockSnapshot.url = "/protected/url";

        guestGuard = TestBed.get(GuestGuard);
        authService = TestBed.get(AuthService);
        router.navigate.calls.reset();
    });

    it("Should be created", inject([GuestGuard], (guard: GuestGuard) => {
        expect(guard).toBeTruthy();
    }));

    it("Should not be able to access route while not logged in", () => {
        authService.isLoggedIn = false;

        expect(guestGuard.canActivate(null, mockSnapshot)).toBe(true);
    });

    it("Should be able to access route while not logged in", () => {
        authService.isLoggedIn = true;
        expect(guestGuard.canActivate(null, mockSnapshot)).toBe(false);
    });
});
