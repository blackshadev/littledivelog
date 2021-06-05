import { TestBed, inject } from "@angular/core/testing";

import { MiscService } from "./misc.service";
import {
    HttpClientTestingModule,
    HttpTestingController,
} from "@angular/common/http/testing";
import { HttpClient } from "@angular/common/http";
import { serviceUrl } from "../shared/config";
import * as FileSaver from "file-saver";
import { OS } from "./browser-detector.constants";

describe("MiscService", () => {
    let service: MiscService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient, MiscService],
        });

        service = TestBed.get(MiscService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it("Should be created", () => {
        expect(service).toBeTruthy();
    });
});
