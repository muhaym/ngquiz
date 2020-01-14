import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import * as firebase from 'firebase';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'Divine Quiz';
  constructor(private router: Router) {

  }
  ngOnInit() {
    const new_fire = firebase.initializeApp(environment.firebase);
  }
}
