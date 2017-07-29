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


		public static ulong[] cols = new ulong[] {
			0x0101010101010101,
			0x0202020202020202,
			0x0404040404040404,
			0x0808080808080808,
			0x1010101010101010,
			0x2020202020202020,
			0x4040404040404040,
			0x8080808080808080
		};

		internal static ulong GetColumns(Square square)
		{
			return cols[(int)square % 8];
		}


		public static ulong[] rows = new ulong[] {
			0x00000000000000FF,
			0x000000000000FF00,
			0x0000000000FF0000,
			0x00000000FF000000,
			0x000000FF00000000,
			0x0000FF0000000000,
			0x00FF000000000000,
			0xFF00000000000000
		};

		internal static ulong GetRows(Square square)
		{
			return rows[(int)Math.Floor((float)square / 8f)];
		}
	}
}
