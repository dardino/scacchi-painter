import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { DbmanagerService } from '@sp/dbmanager/src/public-api';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.styl'],
})
export class MenuComponent implements OnInit {
  @Output()
  selectElement = new EventEmitter<void>();

  constructor(private db: DbmanagerService) {}
  get dbLoaded() {
    return this.db.All.length !== 0;
  }

  ngOnInit(): void {}
}
