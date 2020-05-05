import { LocaldatetimePipe } from './localdatetime.pipe';

describe('LocaldatetimePipe', () => {
    let pipe: LocaldatetimePipe;
    beforeEach(() => {
        pipe = new LocaldatetimePipe();
    });

    it('create an instance', () => {
        expect(pipe).toBeTruthy();
    });

    it('Should translate from utc to timezone', () => {});
});
