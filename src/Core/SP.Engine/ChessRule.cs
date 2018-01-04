namespace SP.Engine
{
	public abstract class ChessRule
	{
		public abstract bool IsMoveValid(GameState gs, Move moveToTest);

	}
}