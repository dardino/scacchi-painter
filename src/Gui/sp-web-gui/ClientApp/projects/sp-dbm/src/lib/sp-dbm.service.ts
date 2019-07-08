import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SpDbmService {
  private http: HttpClient;

  constructor() {}

  LoadDatabase() {
    return this.http.get<ProblemDb>('api/sampledata/file').subscribe({
      complete: () => {}
    });
  }
}

export interface Problem {
  stipulationType: string;
  moves: string;
  date: string;
  maximum: boolean;
  serie: boolean;
  prizeRank: string;
  completeStipulationDesc: string;
  personalID: string;
  prizeDescription: string;
  source: string;
  stipulation: string;
  authors: Author[];
  pieces: Piece[];
}

export interface Author {
  nameAndSurname: string;
  address: string;
  city: string;
  phone: string;
  zipCode: string;
  stateOrProvince: string;
  country: string;
  language: string;
}

interface Piece {
  appearance: string;
  fairyCode: string;
  color: string;
  column: string;
  traverse: string;
  rotation: string;
  fairyAttribute: string;
}

export interface ProblemDb {
  version: string;
  name: string;
  lastIndex: number;
  problems: Problem[];
}
