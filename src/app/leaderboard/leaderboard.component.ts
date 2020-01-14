import { Component, OnInit, EventEmitter } from '@angular/core';
import { UserService } from '../user.service';
import { MatDatepickerInputEvent, MatTabChangeEvent } from '@angular/material';
import { Users } from '../User';
import { Validators, FormControl, FormGroup } from '@angular/forms';
import { MyErrorStateMatcher } from '../login/login.component';
import { LoaderService } from '../loader.service';

@Component({
  selector: 'app-leaderboard',
  templateUrl: './leaderboard.component.html',
  styleUrls: ['./leaderboard.component.scss']
})
export class LeaderboardComponent implements OnInit {


  minDate: Date;
  maxDate: Date;
  scores: Users[];
  displayedColumns: string[] = ['index', 'name', 'mobile', 'result'];
  matcher = new MyErrorStateMatcher();
  dateForm: FormGroup;
  aFromDate = new FormControl('', [
    Validators.required,
  ]);
  aToDate = new FormControl('', [
    Validators.required,
  ]);

  ffromDate = new FormControl('', [
    Validators.required,
  ]);


  constructor(private userService: UserService, private loader: LoaderService) {
    this.minDate = new Date(2019, 11, 24, 0, 0, 0, 0);
    this.maxDate = new Date();
    this.dateForm = new FormGroup({
      afromDate: this.aFromDate,
      atoDate: this.aToDate
    });
  }

  ngOnInit() {
    this.ffromDate.setValue(new Date());
    this.updateScores(this.ffromDate.value);
  }

  async dateChanged(event: MatDatepickerInputEvent<Date>) {
    this.updateScores(event.value);
  }

  async fromDateChanged(event: MatDatepickerInputEvent<Date>) {
    this.getOverallScore();
  }

  async toDateChanged(event: MatDatepickerInputEvent<Date>) {
    this.getOverallScore();
  }

  async getOverallScore() {
    if (this.dateForm.valid) {
      await this.updateScores(this.aFromDate.value, this.aToDate.value);
    }

  }
  async tabChanged(event: any) {
    this.scores = [];
    if (event.index == 0) {
      await this.updateScores(this.ffromDate.value);
    }
    else {
      this.getOverallScore();
    }
  }

  async updateScores(fromDate: Date, toDate?: Date) {
    this.loader.show();
    let x = await this.userService.retreiveScores(fromDate, toDate);
    this.loader.hide();
    this.scores = x.sort((z, y) => z.result - y.result).reverse();
  }

  hashedNumber(number: string) {
    return number.replace(number.substring(8, 12), "****");
  }

}
