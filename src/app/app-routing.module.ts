import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { QuizComponent } from './quiz/quiz.component';
import { ThanksComponent } from './thanks/thanks.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { AuthGuard } from './auth.guard';


const routes: Routes = [
  {
    path: '',
    redirectTo: '/',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'quiz',
    component: QuizComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'thanks',
    component: ThanksComponent,
    canActivate:[AuthGuard]
  },
  {
    path:'leaderboard',
    component:LeaderboardComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
