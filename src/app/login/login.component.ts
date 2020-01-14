import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import { ErrorStateMatcher } from '@angular/material/core';
import { WindowService } from '../window.service';
import * as firebase from 'firebase';
import { PhoneNumber } from './phonenumber';
import { environment } from '../../environments/environment';
import { Router } from '@angular/router';
import { UserService } from '../user.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Users } from '../User';
import { LoaderService } from '../loader.service';

/** Error when invalid control is dirty, touched, or submitted. */
export class MyErrorStateMatcher implements ErrorStateMatcher {
  isErrorState(control: FormControl | null, form: FormGroupDirective | NgForm | null): boolean {
    const isSubmitted = form && form.submitted;
    return !!(control && control.invalid && (control.dirty || control.touched || isSubmitted));
  }
}

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  mobileFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(10),
    Validators.maxLength(10),
    Validators.pattern(/^[6-9]\d{9}$/)
  ]);
  nameFormControl = new FormControl('', [
    Validators.required,
  ]);
  otpFormControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.maxLength(6)
  ]);
  matcher = new MyErrorStateMatcher();
  LoginForm: FormGroup;
  showOTP: boolean;
  windowRef: any;
  user: firebase.auth.UserCredential;
  phoneNumber = new PhoneNumber();
  validateText: string = "SEND LOGIN CODE";
  signResult: firebase.auth.ConfirmationResult;
  constructor(private win: WindowService, private router: Router, private userService: UserService, private snackBar: MatSnackBar, private loader: LoaderService) {
    this.LoginForm = new FormGroup({
      mobilenumber: this.mobileFormControl,
      name: this.nameFormControl,
      otp: this.otpFormControl
    });
  }

  ngOnInit() {
    this.windowRef = this.win.windowRef;
    this.windowRef.recaptchaVerifier = new firebase.auth.RecaptchaVerifier('sign-in-button', {
      'size': 'invisible',
      'callback': function (response) {
        // reCAPTCHA solved, alloFw signInWithPhoneNumber.

      }
    });

  }
  numberChanged() {
    if (!this.mobileFormControl.valid) {
      this.showOTP = false;
      this.validateText = "SEND LOGIN CODE";
    }
  }

  async sendLoginCode() {

    const appVerifier = this.windowRef.recaptchaVerifier;

    this.phoneNumber.country = "91";
    this.phoneNumber.line = this.mobileFormControl.value;
    const num = this.phoneNumber.e164;

    try {
      this.loader.show();
      this.signResult = await firebase.auth().signInWithPhoneNumber(num, appVerifier);
      this.loader.hide();
      if (this.signResult != null) {
        this.showOTP = true;
        this.validateText = "Verify & Start Quiz";
      }
    }
    catch (error) {
      console.log(error);
      this.loader.hide();
    }
  }


  processSubmit() {
    if (this.showOTP)
      this.verifyLoginCode();
    else
      this.sendLoginCode();
  }

  async verifyLoginCode() {

    try {
      this.loader.show();
      this.user = await this.signResult.confirm(this.otpFormControl.value.toString());
      this.loader.hide();
      if (this.user != null) {
        this.user.additionalUserInfo.username = this.nameFormControl.value;
        let status = await this.userService.validateUser(this.user);
        if (status.length > 0 && status[0].lastQuizTaken != null) {
          this.snackBar.open("Sorry, You have already attended the Quiz", "OK");
          return;
        }
        else {
          if (status.length > 0) {
            //Indicates alredy tried to login, but not attended quiz
            localStorage.setItem("user", JSON.stringify(status[0]));
            this.router.navigate(['quiz']);
            return;
          }
          //Indicates a fresh user
          let toAdd: Users = { mobile: this.user.user.phoneNumber, name: this.user.additionalUserInfo.username };
          toAdd.mobile = this.user.user.phoneNumber;
          toAdd.name = this.user.additionalUserInfo.username;
          let id = await this.userService.addUser(toAdd);
          if (id != "0") {
            toAdd.id = id;
            this.loader.show();
            this.userService.updateUser(toAdd);
            this.loader.hide();
            localStorage.setItem("user", JSON.stringify(toAdd));
            this.router.navigate(['quiz']);
            return;
          }
        }
      }
    }
    catch (error) {
      this.snackBar.open("Incorrect OTP", "OK");
      this.loader.hide();
    }
  }
  isOtpReady() {
    if (this.showOTP)
      return this.otpFormControl.valid;
    else {
      return true;
    }
  }
}