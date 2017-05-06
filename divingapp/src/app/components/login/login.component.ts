import { AuthService } from '../../services/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  public email: string;
  public password: string;
  public error: string;

  constructor(
    private auth: AuthService,
  ) { }

  ngOnInit() {}

  onSubmit() {
    this.auth.login(
      this.email,
      this.password
    ).then(
      () => {
        this.redirect();
      }
    ).catch(
      (e) => {
        console.error(e);
        this.error = e.message;
      }
    )
  }

  redirect() {
    /** */
  }

}
