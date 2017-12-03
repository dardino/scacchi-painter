using SP.Core;

namespace SP.Engine.Pieces
{

	[Figurine(PieceFigurine.Bishop)]
	public class Bishop : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Square s, GameState gameState)
		{
			return GetMovesFromPosition(s, gameState) & gameState.enemies; // solo le mosse che coinvolgono i nemici
		}

		#region GetMoves
		public override ulong GetMovesFromPosition(Square s, GameState gameState)
		{
			return CommonUtils.GetDiagonalMoves(s, gameState.allied, gameState.enemies);
		}

		#endregion

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState gameState)
		{
			return (GetCapturesFromPosition(fromSquare, new GameState { enemies = gameState.allied | gameState.enemies | (ulong)squareToCheck.ToSquareBits() }) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
