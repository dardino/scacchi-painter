using SP.Core;

namespace SP.Engine.Pieces
{

	[Figurine(PieceFigurine.Bishop)]
	public class Bishop : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(s, allied, enemies) & enemies; // solo le mosse che coinvolgono i nemici
		}

		#region GetMoves
		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			return CommonUtils.GetDiagonalMoves(s, allied, enemies);
		}

		#endregion

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			return (GetCapturesFromPosition(fromSquare, 0, allied | enemies | (ulong)squareToCheck.ToSquareBits()) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
