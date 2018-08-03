namespace SP.Engine
{
	public class StandardOrtodoxRule: ChessRule
	{
		public override bool IsMoveValid(GameState gs, HalfMove moveToTest)
		{
			var newGs = new GameState(gs.Rules);
			// clono la scacchiera
			newGs.CloneFrom(gs);
			// negli scacchi ortodossi la mossa è valida se dopo la suddetta mossa l'avversario non ha possiblità di mangiare il mio re.
			newGs.ApplyMove(moveToTest);
			var mtStr = moveToTest.ToString();
			return !newGs.IsAttackingSquare(newGs.KingPosition(moveToTest.Piece.Color));
		}
	}
}