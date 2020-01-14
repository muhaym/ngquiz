import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { Users } from './User';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  userCollection: AngularFirestoreCollection<Users>;
  constructor(private afs: AngularFirestore) {
    this.userCollection = this.afs.collection<Users>('users');
  }

  validateUser(user: firebase.auth.UserCredential) {
    let userCollection = this.afs.collection<Users>('users', ref => ref.where('mobile', "==", user.user.phoneNumber));
    let matched = userCollection.valueChanges().pipe(take(1)).toPromise();
    return matched;
  }

  // validateUseruser(user: firebase.auth.UserCredential): Promise<Users[]> {

  //   return this.userCollection.ref.where('mobile', "==", user.user.phoneNumber).get().then(x=>x.docs.map(y=>y.data))
  // }

  async addUser(user: Users) {
    let userCollection = this.afs.collection<Users>('users');
    try {
      let result = await userCollection.add(user);
      return result.id;
    }
    catch (error) {
      return "0";
    }
  }

  async updateUser(user: Users) {
    let userCollection = this.afs.collection<Users>('users');
    return await userCollection.doc(user.id).update(user);
  }

  async retreiveScores(dateFrom: Date, dateTo?: Date) {
    let df = new Date(dateFrom);
    let dt = dateTo == undefined ? undefined : new Date(dateTo);
    if (dt == undefined) {
      df.setHours(0, 0, 0, 0);
      dt = new Date(df);
      dt.setHours(24, 0, 0, 0);
    }
    else {
      df.setHours(0, 0, 0, 0);
      dt.setHours(24, 0, 0, 0);
    }
    let userCollection = this.afs.collection<Users>('users', ref => ref.where('lastQuizTaken', ">=", df).where('lastQuizTaken', '<=', dt));
    return userCollection.valueChanges().pipe(take(1)).toPromise();
  }
}