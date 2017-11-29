using System;
using System.Collections.Generic;
using System.Text;
using SP.Core;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.Rock)]
	public class Rock : EnginePiece
	{


		public override ulong GetCapturesFromPosition(Square s, ulong allied, ulong enemies)
		{
			return GetMovesFromPosition(s, allied, enemies) & enemies; // solo le mosse che coinvolgono i nemici
		}

		public override ulong GetMovesFromPosition(Square s, ulong allied, ulong enemies)
		{
			var r = (int)((BoardSquare)s).Row;
			var c = (int)((BoardSquare)s).Column;
			var sb = (ulong)s.ToSquareBits();

			var trav = (0xFFul << (r * 8)) ^ sb;
			var col = (0x101010101010101ul << c) ^ sb;
			var all = (allied | enemies) & (trav | col);

			var south = (sb - 1);
			var north = ~(south) ^ sb;


			ulong m1 = getSudEst(south & col, all); //mosse possibili a sud
			ulong m2 = getNordOvest(north & col, all); //mosse possibili a nord
			ulong m3 = getSudEst(south & trav, all); //mosse possibili a est
			ulong m4 = getNordOvest(north & trav, all); //mosse possibili a ovest
			ulong sum = (m1 | m2 | m3 | m4);
			return  (sum & allied) ^ sum; // tolgo gli alleati e lascio le catture
		}
		public static ulong getSudEst(ulong dd, ulong allpieces)
		{
			var ss = (dd & allpieces);
			if (ss == 0) return dd;
			return ((CommonUtils.FillFromBigger1(ss) >> 1) & dd) ^ dd;
		}

		private static ulong getNordOvest(ulong dd, ulong allpieces) {
			var ss = CommonUtils.PiecesInLine(dd, allpieces);
			if (ss == 0) return dd;
			return CommonUtils.FillFromSmaller1(ss) & dd;
		}


		public override bool IsAttackingSquare(Square fromSquare, Square squareToCheck, ulong allied, ulong enemies)
		{
			return (GetCapturesFromPosition(fromSquare, allied, enemies) & (ulong)squareToCheck.ToSquareBits()) > 0;
		}
	}
}
