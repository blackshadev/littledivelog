import { TestBed, inject } from '@angular/core/testing';
import {
    PlaceService,
    ICountry,
    IDbCountry,
    IPlaceStat,
} from './place.service';
import {
    HttpTestingController,
    HttpClientTestingModule,
} from '@angular/common/http/testing';
import { HttpClient } from '@angular/common/http';
import { serviceUrl } from '../shared/config';
import { IPlace } from '../shared/dive';

describe('PlaceService', () => {
    let service: PlaceService;
    let httpMock: HttpTestingController;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [HttpClient, PlaceService],
        });

        service = TestBed.get(PlaceService);
        httpMock = TestBed.get(HttpTestingController);
    });

    it('Should be created', inject([PlaceService], (ser: PlaceService) => {
        expect(ser).toBeTruthy();
        expect(ser).toBe(service);
    }));

    describe('List', () => {
        const placeSamples = [
            { place_id: 19, country_code: 'NL', name: 'Heidemeer' },
            { place_id: 20, country_code: 'NL', name: 'Het Koepeltje' },
            { place_id: 21, country_code: 'NL', name: 'Kerkweg Den Osse' },
            { place_id: 18, country_code: 'NL', name: 'De Beldert' },
            { place_id: 18, country_code: 'NL', name: 'De Beldert' },
            { place_id: 18, country_code: 'NL', name: 'De Beldert' },
            { place_id: 22, country_code: 'EG', name: 'Fanadir dach' },
        ];

        it('Should list all without arguments', done => {
            service
                .list()
                .then(arr => {
                    expect(arr).toBe(placeSamples, 'Should not transform data');

                    done();
                })
                .catch(done.fail);
            const req = httpMock.expectOne({
                url: `${serviceUrl}/places`,
                method: 'GET',
            });
            req.flush(placeSamples);
        });

        it('Should list country specific with country code', done => {
            const allNL = placeSamples.filter(p => p.country_code === 'NL');
            service
                .list('NL')
                .then(arr => {
                    expect(arr).toBe(allNL, 'Should not transform data');

                    done();
                })
                .catch(done.fail);
            const req = httpMock.expectOne({
                url: `${serviceUrl}/places/NL`,
                method: 'GET',
            });
            req.flush(allNL);
        });

        it('Should use cache on second full list', done => {
            let d: IPlace[];
            service
                .list()
                .then(_d => {
                    d = _d;
                    return service.list();
                })
                .then(_d => {
                    expect(_d).toBe(
                        d,
                        'expected both lists to return the same result',
                    );
                    done();
                })
                .catch(done.fail);

            const req = httpMock.expectOne({
                url: `${serviceUrl}/places`,
                method: 'GET',
            });
            req.flush(placeSamples);
            httpMock.expectNone({
                url: `${serviceUrl}/places`,
                method: 'GET',
            });
        });
    });

    describe('Countries', () => {
        const countrySample: IDbCountry[] = [
            { iso2: 'AF', name: 'Afghanistan' },
            { iso2: 'AX', name: 'Åland Islands' },
        ];
        const transformedCountries = PlaceService.transformCountries(
            countrySample,
        );
        it('Should request countries and return transformed data', done => {
            service
                .countries()
                .then(d => {
                    expect(d).toEqual(transformedCountries);
                    done();
                })
                .catch(done.fail);
            const req = httpMock.expectOne({
                url: `${serviceUrl}/countries`,
                method: 'GET',
            });
            req.flush(countrySample);
        });

        it('Should use cache on second query', done => {
            let data: ICountry[];
            service
                .countries()
                .then(d => {
                    data = d;
                    return service.countries();
                })
                .then(d => {
                    expect(data).toBe(d);
                    done();
                })
                .catch(done.fail);
            const req = httpMock.expectOne({
                url: `${serviceUrl}/countries`,
                method: 'GET',
            });
            req.flush(countrySample);
            httpMock.expectNone({
                url: `${serviceUrl}/countries`,
                method: 'GET',
            });
        });
    });
});
