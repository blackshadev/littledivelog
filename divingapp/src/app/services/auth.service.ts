import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Headers, Http,  Response } from '@angular/http';
import { serviceUrl } from '../shared/config';
import 'rxjs/add/operator/toPromise';

@Injectable()
export class AuthService {

  private jwt: string;
  get token() { return this.jwt; }
  get isLoggedIn() { return !!this.jwt; }

  constructor(
    private http: Http,
    private route: ActivatedRoute,
    private router: Router,
  ) {
    // tslint:disable-next-line:max-line-length
    this.jwt = localStorage.getItem('jwt');
  }

  logout() {
    localStorage.removeItem('jwt');
    this.jwt = null;
    this.gotoLogin();
  }

  gotoLogin() {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.route.snapshot.url }});
  }

  async login(
    email: string,
    password: string,
  ): Promise<void> {

    try {
      const a = await this.http.post(
        `${serviceUrl}/auth/`,
        {
          email,
          password,
        },
      ).toPromise();

      const o = a.json();
      if (o.error) {
        throw new Error(o.error);
      } else {
        this.jwt = o.jwt;
        localStorage.setItem('jwt', this.jwt);
      }

    } catch (e) {

      if (e instanceof Response) {
        let o: any;
        try {
          o = e.json();
        } catch (_e) { /* NOOP, will be thrown by next statement */ }
        if (o && o.error) {
          throw new Error(o.error);
        }
      }
      throw new Error('Unable to parse server response');

    }

  }

}
