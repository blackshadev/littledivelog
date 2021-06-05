import { DivetimePipe } from "./divetime.pipe";

describe("DivetimePipe", () => {
    let pipe: DivetimePipe;
    beforeEach(() => {
        pipe = new DivetimePipe();
    });

    it("create an instance", () => {
        expect(pipe).toBeTruthy();
    });

    it("Should Format 4140 as 01:09:00", () => {
        expect(pipe.transform(4140)).toBe("01:09:00");
    });

    it("Should Format 4145 as 01:09:00", () => {
        expect(pipe.transform(4145)).toBe("01:09:05");
    });

    it("Should Format 0 as 00:00:00", () => {
        expect(pipe.transform(0)).toBe("00:00:00");
    });

    it("Should Format null as 00:00:00", () => {
        expect(pipe.transform(null)).toBe("00:00:00");
    });
});
