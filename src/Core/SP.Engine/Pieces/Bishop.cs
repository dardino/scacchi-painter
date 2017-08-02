using SP.Core;

namespace SP.Engine.Pieces
{

	[Figurine(PieceFigurine.Bishop)]
	public class Bishop : EnginePiece
	{

		public override ulong GetCapturesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			return GetCapturesFromPosition(BoardSquare.GetSquareIndex(col, row), allied, enemies);
		}

		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(s, allied, enemies) & enemies; // solo le mosse che coinvolgono i nemici
		}

		#region GetMoves
		public override ulong GetMovesFromPosition(Columns col, Rows row)
		{
			return GetMovesFromPosition(col, row, 0, 0);
		}
		public override ulong GetMovesFromPosition(Columns col, Rows row, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(BoardSquare.GetSquareIndex(col, row), allied, enemies);
		}

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

			var se = getSouthDiagMoves(south & mydiagA, allpieces); //mosse possibili in S-E
			var nw = getNorthDiagMoves(north & mydiagA, allpieces); //mosse possibili in N-W
			var sw = getSouthDiagMoves(south & mydiagB, allpieces); //mosse possibili in S-W
			var ne = getNorthDiagMoves(north & mydiagB, allpieces); //mosse possibili in N-E

			return (nw | ne | sw | se) ^ allied; // tolgo gli alleati e lascio le catture
		}

		private static ulong getNorthDiagMoves(ulong dd, ulong allpieces) {
			var ss = (dd & allpieces);
			if (ss == 0) return dd;
			return ((~fillFromSmaller1(ss) << 1) & dd) ^ dd;
		}
		private static ulong getSouthDiagMoves(ulong dd, ulong allpieces)
		{
			var ss = (dd & allpieces);
			if (ss == 0) return dd;
			return ((fillFromBigger1(ss) >> 1) & dd) ^ dd;
		}

		private static ulong fillFromSmaller1(ulong bb)
		{
			return ((bb - 1) ^ bb);
		}
		private static ulong fillFromBigger1(ulong bb) {
			bb |= bb >> 32;
			bb |= bb >> 16;
			bb |= bb >> 8;
			bb |= bb >> 4;
			bb |= bb >> 2;
			bb |= bb >> 1;
			return bb;
		}
		#endregion

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			return (GetCapturesFromPosition(fromSquare, allied, enemies) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
