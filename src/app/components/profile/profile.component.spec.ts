import { ComponentFixture, TestBed, waitForAsync } from "@angular/core/testing";

import { ProfileComponent } from "./profile.component";
import { ProfileService } from "app/services/profile.service";
import { FormBuilder } from "@angular/forms";
import { HttpClientTestingModule } from "@angular/common/http/testing";

describe("ProfileComponent", () => {
    let component: ProfileComponent;
    let fixture: ComponentFixture<ProfileComponent>;
    let service: jasmine.SpyObj<ProfileService>;

    const data = {
        profile: {
            name: "tester",
            buddy_count: 1,
            computer_count: 1,
            dive_count: 1,
            email: "tester@tester.com",
            inserted: new Date("2020-12-12T12:12:12"),
            tag_count: 1,
        },
        equipment: {
            tanks: [
                {
                    oxygen: 21,
                    pressure: {
                        begin: 190,
                        end: 60,
                        type: "bar" as "bar",
                    },
                    volume: 10,
                },
            ],
        },
        sessions: [
            {
                description: "test",
                insert_ip: "127.0.0.1",
                inserted: new Date("2020-12-12T12:12:12"),
                last_ip: "127.0.0.1",
                last_used: new Date("2020-12-12T12:12:12"),
                token: "xxx-xxx",
                user_id: -1,
            },
        ],
    };

    beforeEach(
        waitForAsync(() => {
            TestBed.configureTestingModule({
                imports: [HttpClientTestingModule],
                declarations: [ProfileComponent],
                providers: [ProfileService, FormBuilder],
            }).compileComponents();
        }),
    );

    beforeEach(() => {
        service = spyOnAllFunctions(TestBed.get(ProfileService));
        service.get.and.resolveTo(data.profile);
        service.equipment.and.resolveTo(data.equipment);
        service.getSessions.and.resolveTo(data.sessions);

        fixture = TestBed.createComponent(ProfileComponent);
        component = fixture.componentInstance;

        fixture.detectChanges();
    });

    it("should create", () => {
        expect(component).toBeTruthy();
    });

    describe("refresh", () => {
        beforeEach(async () => {
            await component.refresh();
            await component.refreshSessions();
        });
        it("should call get service", () => {
            expect(service.get).toHaveBeenCalled();
        });

        it("should call equipment service", () => {
            expect(service.equipment).toHaveBeenCalled();
        });

        it("should call session service", () => {
            expect(service.getSessions).toHaveBeenCalled();
        });

        it("should fill profile", () => {
            expect(component.profileForm.value).toEqual({
                name: data.profile.name,
            });
        });

        it("should fill equipment", () => {
            expect(component.equipmentForm.value).toEqual({
                tank: {
                    volume: data.equipment.tanks[0].volume,
                    oxygen: data.equipment.tanks[0].oxygen,
                    pressure: {
                        begin: data.equipment.tanks[0].pressure.begin,
                        end: data.equipment.tanks[0].pressure.end,
                        type: data.equipment.tanks[0].pressure.type,
                    },
                },
            });
        });
    });

    describe("change password", () => {
        describe("Valid", () => {
            beforeEach(async () => {
                component.passwordForm.setValue({
                    currentPassword: "test",
                    newPassword: "test",
                    confirmNewPassword: "test",
                });
                await component.changePassword();
            });

            it("Should call service", () =>
                expect(service.changePassword).toHaveBeenCalled());

            it("Should set alertMessage", () =>
                expect(component.alertMessage).toEqual(
                    jasmine.objectContaining({
                        for: "password",
                        type: "success",
                        text: "Password changed",
                    }),
                ));

            it("set error message on rejection", async () => {
                service.changePassword.and.rejectWith({
                    json() {
                        return { msg: "Test Fail" };
                    },
                });
                await component.changePassword();

                expect(component.alertMessage).toEqual({
                    for: "password",
                    type: "error",
                    text: "Test Fail",
                });
            });
        });

        describe("Invalid", () => {
            beforeEach(async () => {
                component.passwordForm.setValue({
                    currentPassword: "test",
                    newPassword: "test2",
                    confirmNewPassword: "test",
                });
                await component.changePassword();
            });

            it("should not call service", () =>
                expect(service.changePassword).not.toHaveBeenCalled());

            it("Form should be invalid", () =>
                expect(component.passwordForm.valid).toBeFalse());
        });
    });

    describe("Delete sessions", () => {
        beforeEach(async () => await component.deleteSession("tok"));

        it("Should call delete session", () =>
            expect(service.deleteSession).toHaveBeenCalledWith("tok"));
        it("Should call refresh session", () =>
            expect(service.getSessions).toHaveBeenCalled());
    });

    describe("change equipment", () => {
        beforeEach(async () => {
            await component.changeEquipment();
        });

        it("call service", () =>
            expect(service.changeEquipment).toHaveBeenCalled());

        it("alert message set", () =>
            expect(component.alertMessage).toEqual({
                for: "equipment",
                type: "success",
                text: "Equipment changed",
            }));

        it("set error message on rejection", async () => {
            service.changeEquipment.and.rejectWith({
                json() {
                    return { msg: "Test Fail" };
                },
            });
            await component.changeEquipment();

            expect(component.alertMessage).toEqual({
                for: "equipment",
                type: "error",
                text: "Test Fail",
            });
        });
    });
});
