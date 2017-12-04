using SP.Core;

namespace SP.Engine.Pieces
{

	[Figurine(PieceFigurine.Bishop)]
	public class Bishop : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Square s, GameState gameState)
		{
			return GetMovesFromPosition(s, gameState) & gameState.Enemies; // solo le mosse che coinvolgono i nemici
		}

		#region GetMoves
		public override ulong GetMovesFromPosition(Square s, GameState gameState)
		{
			return CommonUtils.GetDiagonalMoves(s, gameState.Allied, gameState.Enemies);
		}

		#endregion

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState gameState)
		{
			return (GetCapturesFromPosition(fromSquare, new GameState { Enemies = gameState.Allied | gameState.Enemies | (ulong)squareToCheck.ToSquareBits() }) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
