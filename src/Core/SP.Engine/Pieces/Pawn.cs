using System;
using System.Collections;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Pawn)]
	public class Pawn : EnginePiece
	{
		
		public override ulong GetCapturesFromPosition(Square s, GameState g)
		{
			int index = (int)s;
			int i1 = index + (Color == PieceColors.White ? 7 : -7);
			int i2 = index + (Color == PieceColors.White ? 9 : -9);
			ulong m1 = (i1 <= 0 || i1 > 63 || index == (int)Columns.ColH) ? 0 : (ulong)Math.Pow(2, i1);
			ulong m2 = (i2 <= 0 || i2 > 63 || index == (int)Columns.ColA) ? 0 : (ulong)Math.Pow(2, i2);
			return (m1 | m2) & g.Enemies;
		}

		public override ulong GetMovesFromPosition(Square s, GameState g)
		{
			int index = (int)s;
			int i1 = index + (Color == PieceColors.White ? 8 : -8);
			int i2 = index + (Color == PieceColors.White ? 16 : -16);
			if (i1 <= 0 || i1 > 63) return GetCapturesFromPosition(s, g);
			var m1 = (ulong)Math.Pow(2, i1);
			if ((g.Enemies & m1) != 0) return GetCapturesFromPosition(s, g);
			ulong m2 = 0;
			ulong fromOrigin = (Color == PieceColors.White) ? (ulong)0x0000000000ff0000 : 0x0000ff0000000000;
			if ((m1 & fromOrigin) > 0) m2 = (ulong)Math.Pow(2, i2);
			var freeMove = (g.Enemies & (m1 | m2)) ^ (m1 | m2);
			return freeMove | GetCapturesFromPosition(s, g);
		}

		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, GameState g)
		{
			ulong sq = (ulong)squareToCheck.ToSquareBits();
			var moves = GetMovesFromPosition(fromSquare, GameState.FromOnlyEnemies(g.Allied | g.Enemies | sq, g.MoveTo));
			return (moves & sq) > 0;
		}
	}
}
