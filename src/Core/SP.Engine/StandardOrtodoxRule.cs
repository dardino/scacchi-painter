using System.Threading;

namespace SP.Engine
{
	public class StandardOrtodoxRule: ChessRule
	{
		public override bool IsMoveValid(GameState gs, HalfMove moveToTest)
		{
			var tokenSource = new CancellationTokenSource();
			var newGs = new GameState(gs.Rules);
			// clono la scacchiera
			GameStateStatic.CloneTo(gs, newGs);
			// negli scacchi ortodossi la mossa è valida se dopo la suddetta mossa l'avversario non ha possiblità di mangiare il mio re.
			GameStateStatic.ApplyMove(newGs, moveToTest, tokenSource.Token);
			var mtStr = moveToTest.ToString();
			return !GameStateStatic.IsAttackingSquare(ref newGs, GameStateStatic.KingPosition(ref newGs, moveToTest.Piece.Color));
		}
	}
}