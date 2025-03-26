import { TournamentSection } from "./tournamentSection";

export interface Tournament {
  id: string;
  title: string;
  submissionDeadline: string;
  sections: Array<TournamentSection>;
}
