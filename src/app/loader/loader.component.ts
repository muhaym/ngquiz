import { Component, OnInit, NgZone } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService, LoaderState } from '../loader.service';

@Component({
  selector: 'app-loader',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.scss']
})
export class LoaderComponent implements OnInit {

  loading: boolean = false;
  private subscription: Subscription;

  constructor(
    private _loadingService: LoaderService,
    private _zone: NgZone
  ) { }

  ngOnInit() {
    this.subscription = this._loadingService.loaderState
      .subscribe((state: LoaderState) => {
        this.loading = state.show;
      });
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
  }

}
