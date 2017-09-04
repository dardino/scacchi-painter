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
			var sqb = (ulong)s.ToSquareBits();
			var alldiag = CommonUtils.GetDiagonals(s) ^ sqb;
			enemies = enemies & alldiag;
			allied = allied & alldiag;
			var allpieces = (allied | enemies);
			if (allpieces == 0) return alldiag;

			var mydiagA = CommonUtils.GetBotLeft2TopRightDiagonal(s) ^ sqb;
			var mydiagB = CommonUtils.GetTopLeft2BottomRight(s) ^ sqb;

			var south = (sqb - 1) >> 1;
			var north = ~south << 1;

			var se = CommonUtils.GetLowerMoves(south & mydiagA, allpieces); //mosse possibili in S-E
			var nw = CommonUtils.GetHigherMoves(north & mydiagA, allpieces); //mosse possibili in N-W
			var sw = CommonUtils.GetLowerMoves(south & mydiagB, allpieces); //mosse possibili in S-W
			var ne = CommonUtils.GetHigherMoves(north & mydiagB, allpieces); //mosse possibili in N-E

			return (nw | ne | sw | se) ^ allied; // tolgo gli alleati e lascio le catture
		}

		#endregion

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			return (GetCapturesFromPosition(fromSquare, allied, enemies | (ulong)squareToCheck.ToSquareBits()) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
