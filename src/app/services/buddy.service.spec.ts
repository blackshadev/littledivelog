import { TestBed, inject } from "@angular/core/testing";
import { BuddyService, IBuddyStat } from "./buddy.service";
import {
    HttpClientTestingModule,
    HttpTestingController,
    TestRequest,
} from "@angular/common/http/testing";
import { IBuddy } from "../shared/dive";
import { serviceUrl } from "../shared/config";

describe("BuddyService", () => {
    let service: BuddyService;
    let httpMock: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [BuddyService],
        });

        service = TestBed.inject(BuddyService);
        httpMock = TestBed.inject(HttpTestingController);
    });

    it("should be created", inject([BuddyService], (b: BuddyService) => {
        expect(b).toBeTruthy();
        expect(b).toEqual(service);
    }));

    describe("List", () => {
        const testData: IBuddy[] = [
            {
                buddy_id: 0,
                color: "#fff",
                email: "tester@test.com",
                text: "tester test",
            },
            {
                buddy_id: 1,
                color: "#fff",
                email: "teste01r@test.com",
                text: "tester01 test",
            },
        ] as IBuddy[];
        let list: IBuddy[];
        let req: TestRequest;

        beforeEach((done) => {
            service
                .list()
                .then((d) => {
                    list = d;
                    done();
                })
                .catch(done);

            req = httpMock.expectOne({
                url: `${serviceUrl}/buddies/`,
                method: "GET",
            });
            req.flush(testData);
        });

        it("Should have valid output", () => {
            expect(list).toBe(testData);
        });

        it("Should use cache with in later requests", async (done) => {
            service
                .list()
                .then((d) => {
                    expect(d).toBe(list);
                    expect(d).toBe(testData);
                    done();
                })
                .catch(done);

            httpMock.expectNone(`${serviceUrl}/buddies/`);
        });

        it("Should request after clear cache", () => {
            const newDat = testData.slice(1);
            service.clearCache();

            service.list().then((d) => {
                expect(d).not.toEqual(testData);
                expect(d).toBe(newDat);
            });
            const _req = httpMock.expectOne(`${serviceUrl}/buddies/`);
            expect(_req.request.method).toEqual("GET");
            _req.flush(newDat);
        });
    });

    it("fullList", async (done) => {
        const testData: IBuddyStat[] = [
            {
                buddy_id: 0,
                color: "#fff",
                email: "tester@test.com",
                text: "tester test",
                buddy_user_id: 5,
                dive_count: 10,
                last_dive: new Date("2017-01-01"),
            },
            {
                buddy_id: 1,
                color: "#fff",
                email: "teste01r@test.com",
                text: "tester01 test",
                buddy_user_id: 6,
                dive_count: 15,
                last_dive: new Date("2017-06-01"),
            },
        ];

        service
            .fullList()
            .then((list) => {
                expect(list).toBe(testData);

                done();
            })
            .catch(done);

        const req = httpMock.expectOne({
            url: `${serviceUrl}/buddies/`,
            method: "GET",
        });
        req.flush(testData);
    });

    it("delete", (done) => {
        const testData = true;
        let req: TestRequest;
        let spy: jasmine.Spy;

        spy = spyOn(service, "clearCache");
        service
            .delete(5)
            .then((result) => {
                expect(result as any).toEqual(JSON.stringify(testData));
                expect(spy).toHaveBeenCalled();

                done();
            })
            .catch(done.fail);

        req = httpMock.expectOne({
            url: `${serviceUrl}/buddies/5`,
            method: "DELETE",
        });
        req.flush(JSON.stringify(testData));
    });

    it("update", (done) => {
        const testData: IBuddy = {
            buddy_id: 1,
            color: "#fff",
            email: "teste01r@test.com",
            text: "tester01 test",
        };
        let req: TestRequest;

        const spy = spyOn(service, "clearCache");
        service
            .update(testData)
            .then((result) => {
                expect(result).toEqual(
                    testData,
                    "Invalid output, expected input and output to be the same",
                );
                expect(spy).toHaveBeenCalled();

                done();
            })
            .catch(done);

        req = httpMock.expectOne({
            url: `${serviceUrl}/buddies/${testData.buddy_id}`,
            method: "PUT",
        });
        req.flush(testData);
        expect(req.request.body).toBe(testData);
    });

    it("insert", (done) => {
        const testData: IBuddy = {
            buddy_id: undefined,
            color: "#fff",
            email: "teste01r@test.com",
            text: "tester01 test",
        };
        const resData: IBuddy = Object.assign({}, testData, { buddy_id: 9 });

        let req: TestRequest;
        const spy: jasmine.Spy = spyOn(service, "clearCache");
        service
            .update(testData)
            .then((result) => {
                expect(result).toEqual(
                    resData,
                    "Unexpected result data, expected input data with buddy_id filled",
                );
                expect(result).not.toEqual(
                    testData,
                    "Input and output should not be same",
                );
                expect(spy).toHaveBeenCalled();

                done();
            })
            .catch(done.fail);

        req = httpMock.expectOne({
            url: `${serviceUrl}/buddies/`,
            method: "POST",
        });
        req.flush(resData);
        expect(req.request.body).toBe(testData);
    });
});
