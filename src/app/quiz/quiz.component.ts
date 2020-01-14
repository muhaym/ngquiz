import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { FormControl, FormGroupDirective, NgForm, Validators, FormGroup } from '@angular/forms';
import questions from '../../assets/questions.json';
import { Questions, Option } from './Questions';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatRadioGroup } from '@angular/material/radio';
import { MatSelectionList, MatListOption } from '@angular/material/list';
import { SelectionModel } from '@angular/cdk/collections';
import { ThemePalette } from '@angular/material/core';
import { interval, Observable, timer, Subscription } from 'rxjs';
import { UserService } from '../user.service.js';
import { Users } from '../User.js';
import { Router } from '@angular/router';
import { LoaderService } from '../loader.service.js';


@Component({
  selector: 'app-quiz',
  templateUrl: './quiz.component.html',
  styleUrls: ['./quiz.component.scss']
})
export class QuizComponent implements OnInit {
  @ViewChild(MatSelectionList, { static: true }) Answers: MatSelectionList;
  favoriteSeason: string;
  sessionQuestions: Questions[];
  currentQuestion: Questions;
  subscribeTimer: any;
  correctAnswerCount: number = 0;
  checkButton: string = "Check Answer";
  countDownTimer: Subscription;
  maxSeconds: number = 4;
  constructor(private snackBar: MatSnackBar, private userService: UserService, private router: Router, private loader : LoaderService) { }

  ngOnInit() {
    this.Answers.selectedOptions = new SelectionModel<MatListOption>(false);
    this.buildRandom();
    this.showQuestion();

  }

  resetcountdown() {
    this.maxSeconds = 30;
    if (this.countDownTimer != null && !this.countDownTimer.closed)
      this.countDownTimer.unsubscribe();
    let cd = interval(1000);
    this.countDownTimer = cd.subscribe(x => {
      this.subscribeTimer = this.maxSeconds.toString();
      this.maxSeconds--;
      if (this.maxSeconds < 0) {
        this.subscribeTimer = "Time Out";
        this.Answers.disabled = true;
        if (!this.countDownTimer.closed)
          this.countDownTimer.unsubscribe();
      }
    })
  }

  stopcountdown() {
    if (!this.countDownTimer.closed) {
      this.countDownTimer.unsubscribe();
      this.subscribeTimer = "";
    }
  }


  buildRandom() {
    //shuffles questions from master collection
    const shuffled = questions.sort(() => 0.5 - Math.random());
    //take 10 question from shuffled list
    this.sessionQuestions = shuffled.slice(0, 10);
    //loop through all questions to shuffle options
    for (let x of this.sessionQuestions) {
      //shuffles options
      x.options = x.options.sort(() => 0.5 - Math.random());
    }
  }



  submitActions() {
    if (this.checkButton.includes("Next Question"))
      this.showQuestion();
    else if (this.checkButton.includes("Submit Results"))
      this.submitResult();
    else {
      this.checkAnswer();
    }

  }

  async submitResult() {
    this.stopcountdown();
    let user: Users = JSON.parse(localStorage.getItem("user"));
    user.lastQuizTaken = new Date();
    user.result = this.correctAnswerCount;
    this.loader.show();
    await this.userService.updateUser(user);
    this.loader.hide();
    await this.router.navigate(["thanks"],{ replaceUrl: true });
  }

  prepareButton(){
    if(this.sessionQuestions.length==0)
    {
      this.checkButton = "Submit Results";
    }
    else
    {
      this.checkButton = "Next Question";
    }
  }


  checkAnswer() {
    let selectedItem = this.Answers.selectedOptions.selected[0];
    //if no item selected, and time is remaining, ask to select
    if (selectedItem == null && this.maxSeconds > 0) {
      this.snackBar.open('Please select the answer', null, { duration: 3000 });
      return;
    }
    // handle case where no answer selected, but timed out
    this.stopcountdown();
    if (selectedItem == null) {
      let correctelement = this.Answers.options.filter(x => x.value.answer == true)[0];
      if (correctelement != null) {
        correctelement._text.nativeElement.style.color = "green";
        this.prepareButton();
        return;
      }
    }
    // handle answer is correct case
    if (selectedItem.value.answer == true) {
      selectedItem._text.nativeElement.style.color = "green";
      this.Answers.disabled = true;
      this.correctAnswerCount++;
    }
    else {
      selectedItem._text.nativeElement.style.color = "red";
      let correctelement = this.Answers.options.filter(x => x.value.answer == true)[0];
      if (correctelement != null)
        correctelement._text.nativeElement.style.color = "green";
      this.Answers.disabled = true;
    }
    this.prepareButton();
    
  }

  showQuestion() {
    if (this.sessionQuestions.length == 0) {
      this.checkButton = "Submit Results" + " " + this.correctAnswerCount;
      return;
    }
    this.Answers.disabled = false;
    this.checkButton = "Check Answer";
    this.resetcountdown();
    if (this.sessionQuestions.length > 0)
      this.currentQuestion = this.sessionQuestions.shift();

  }
}
