import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { ElementRef } from '@angular/core';
import { MenuComponent } from './components/menu/menu.component';
import { AppRoutingModule } from './app.routing';

describe('AppComponent', () => {
    beforeEach(async(() => {
        TestBed.configureTestingModule({
            declarations: [AppComponent, MenuComponent],
            providers: [
                {
                    provide: ElementRef,
                },
            ],
            imports: [AppRoutingModule],
        }).compileComponents();
    }));

    it('should create the app', async(() => {
        const fixture = TestBed.createComponent(AppComponent);
        const app = fixture.debugElement.componentInstance;
        expect(app).toBeTruthy();
    }));

    // it(`should have as title 'app works!'`, async(() => {
    //     const fixture = TestBed.createComponent(AppComponent);
    //     const app = fixture.debugElement.componentInstance;
    //     expect(app.title).toEqual('app works!');
    // }));
});
