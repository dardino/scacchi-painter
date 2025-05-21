import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { Tournament } from '@dtos/tournament';

type ListTournament = Tournament[];

@Component({
    selector: 'app-app-tournaments',
    templateUrl: './app-tournaments.component.html',
    styleUrl: './app-tournaments.component.less',
    
})
export class AppTournamentsComponent {

  message: string;

  constructor(private http: HttpClient) {
    this.http.get<ListTournament>('api/listtournament')
      .subscribe((resp) => this.message = resp.map(row => [row.id,row.title].join(" - ")).join("\r\n"));
  }
}
