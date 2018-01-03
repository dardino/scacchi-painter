using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Pawn)]
	[PieceName("P")]
	public class Pawn : EnginePiece
	{
		
		public override ulong GetCapturesFromPosition(Square s, GameState g)
		{
			return GetAttackingSquares(s, g) & g.Enemies;
		}

		public override ulong GetMovesFromPosition(Square s, GameState g)
		{
			int index = (int)s;
			int i1 = index + (Color == PieceColors.White ? 8 : -8);
			int i2 = index + (Color == PieceColors.White ? 16 : -16);
			if (i1 < 0 || i1 > 63) return 0; // nessuna mossa permessa-> sono in fondo alla scacchiera
			var m1 = (ulong)Math.Pow(2, i1);
			var capt = GetCapturesFromPosition(s, g);
			if ((g.Enemies & m1) != 0) return capt;
			ulong m2 = 0;
			ulong fromOrigin = (Color == PieceColors.White) ? (ulong)0x0000000000ff0000 : 0x0000ff0000000000;
			if ((m1 & fromOrigin) > 0) m2 = (ulong)Math.Pow(2, i2);
			var freeMove = (g.Enemies & (m1 | m2)) ^ (m1 | m2);
			return freeMove | capt;
		}

		public override ulong GetAttackingSquares(Square s, GameState gInfo)
		{
			int index = (int)s;
			int i1 = index + (Color == PieceColors.White ? 9 : -7);
			int i2 = index + (Color == PieceColors.White ? 7 : -9);
			ulong m1 = (i1 <= 0 || i1 > 63 || s.GetColumn() == Columns.ColA) ? 0 : (ulong)Math.Pow(2, i1);
			ulong m2 = (i2 <= 0 || i2 > 63 || s.GetColumn() == Columns.ColH) ? 0 : (ulong)Math.Pow(2, i2);
			return (m1 | m2);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState g)
		{
			ulong sq = (ulong)squareToCheck.ToSquareBits();
			var moves = GetAttackingSquares(fromSquare, g);
			return (moves & sq) > 0;
		}
	}
}
