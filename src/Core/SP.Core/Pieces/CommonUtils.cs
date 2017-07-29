using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Pieces
{
	public static class CommonUtils
	{
		public static ulong DiagonalA1H8 = 0x0102040810204080;
		public static ulong DiagonalA8H1 = 0x8040201008040201;

		public static ulong GetBotLeft2TopRightDiagonal(Square s) {
			var offset = (int)s % 7;
			var da = DiagonalA1H8 << (8 * offset);
			var db = DiagonalA1H8 >> (8 * (7 - offset));
			var mybit = (ulong)s.ToSquareBits();
			return (mybit & da) > 0 ? da : db;
		}

		internal static ulong GetTopLeft2BottomRight(Square s)
		{
			var offset = (int)s % 9;
			var da = offset < 8 ? DiagonalA8H1 >> (8 * offset) : 0;
			var db = offset > 1 ? DiagonalA8H1 << (8 * (9 - offset)) : 0;
			var mybit = (ulong)s.ToSquareBits();
			return (mybit & da) > 0 ? da : db;
		}

		internal static ulong GetDiagonals(Square s) {
			return GetTopLeft2BottomRight(s) | GetBotLeft2TopRightDiagonal(s);
		}
	}
}
