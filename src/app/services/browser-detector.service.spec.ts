import { TestBed } from "@angular/core/testing";

import { BrowserDetectorService } from "./browser-detector.service";
import { OS } from "./browser-detector.constants";

describe("BrowserDetectorService", () => {
    let service: BrowserDetectorService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(BrowserDetectorService);
    });

    it("should be created", () => {
        expect(service).toBeTruthy();
    });

    describe("Linux chrome useragent", () => {
        beforeEach(() => {
            service.setUserAgent(
                "mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/83.0.4103.61 Safari/537.36",
            );
        });

        it("Should detect linux", () => {
            expect(service.isLinux).toBeTrue();
            expect(service.os).toEqual(OS.Linux);
        });
    });

    describe("Windows chrome useragent", () => {
        beforeEach(() => {
            service.setUserAgent(
                "Mozilla/5.0 (Windows NT 6.1; Win64; x64; rv:47.0) Gecko/20100101 Firefox/47.0",
            );
        });

        it("Should detect windows", () => {
            expect(service.isWindows).toBeTrue();
            expect(service.os).toEqual(OS.Window);
        });
    });
});
