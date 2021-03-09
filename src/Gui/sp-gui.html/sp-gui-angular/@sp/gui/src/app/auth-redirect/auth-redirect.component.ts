import { Component, OnInit } from '@angular/core';
import { TokenResponse } from '@sp/dbmanager/src/lib/oauth_funcs/pkce';

@Component({
  selector: 'app-auth-redirect',
  templateUrl: './auth-redirect.component.html',
  styleUrls: ['./auth-redirect.component.styl'],
})
export class AuthRedirectComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {
    const search = new URLSearchParams(`?${location.hash}`);
    const tokenMessage: TokenResponse = {
      uid: search.get('uid') ?? '',
      access_token: search.get('access_token') ?? '',
      token_type: search.get('token_type') ?? '',
      state: search.get('state') ?? '',
      scope: search.get('scope') ?? '',
      account_id: search.get('account_id') ?? '',
    };

    window.opener.postMessage(tokenMessage, location.origin);
  }
}
