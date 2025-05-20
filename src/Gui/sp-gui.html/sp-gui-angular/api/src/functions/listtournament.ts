import { TableClient } from "@azure/data-tables";
import { HttpRequest, HttpResponseInit, InvocationContext, app } from "@azure/functions";
import { Tournament } from "../dtos/tournament";


const tablesUrl = `https://scacchipainterstorage.table.core.windows.net`;
const sasToken = `sp=r&st=2024-07-02T10:54:35Z&se=2025-07-03T10:54:00Z&spr=https&sv=2022-11-02&sig=6HbIVPTUWyqh05jNYjXbXrC8h5oZcsC4w2rjWM%2FIp78%3D&tn=Tournaments`;

type TableTournaments = Pick<Tournament, "title" | "submissionDeadline"> & { sections: string; };

export async function listtournament(_request: HttpRequest, _context: InvocationContext): Promise<HttpResponseInit> {
  const tournamentList: Tournament[] = [];
  const client = new TableClient(`${tablesUrl}?${sasToken}`, "Tournaments");
  const entities = client.listEntities<TableTournaments>();

  // this loop will get all the entities from all the pages
  // returned by the service
  for await (const entity of entities) {
    tournamentList.push({
      title: entity.title,
      sections: JSON.parse(entity.sections),
      id: entity.rowKey,
      submissionDeadline: entity.submissionDeadline,
    })
  }

  return { body: JSON.stringify(tournamentList) };
};

app.http('listtournament', {
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: listtournament
});
