import { TestBed, inject } from '@angular/core/testing';

import { DiveService } from './dive.service';

describe('DiveService', () => {
    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [DiveService]
        });
    });

    it('should ...', inject([DiveService], (service: DiveService) => {
        expect(service).toBeTruthy();
    }));
});
