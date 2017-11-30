using SP.Core;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Engine.Pieces
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

		public static ulong GetTopLeft2BottomRight(Square s)
		{
			var offset = (int)s % 9;
			var da = offset < 8 ? DiagonalA8H1 >> (8 * offset) : 0;
			var db = offset > 1 ? DiagonalA8H1 << (8 * (9 - offset)) : 0;
			var mybit = (ulong)s.ToSquareBits();
			return (mybit & da) > 0 ? da : db;
		}

		public static ulong GetDiagonals(Square s) {
			return GetTopLeft2BottomRight(s) | GetBotLeft2TopRightDiagonal(s);
		}


		public static ulong[] Cols = new ulong[] {
			0x0101010101010101,
			0x0202020202020202,
			0x0404040404040404,
			0x0808080808080808,
			0x1010101010101010,
			0x2020202020202020,
			0x4040404040404040,
			0x8080808080808080
		};

		public static ulong GetColumns(Square square)
		{
			return Cols[(int)square % 8];
		}


		public static ulong[] Rows = new ulong[] {
			0x00000000000000FF,
			0x000000000000FF00,
			0x0000000000FF0000,
			0x00000000FF000000,
			0x000000FF00000000,
			0x0000FF0000000000,
			0x00FF000000000000,
			0xFF00000000000000
		};

		public static ulong GetRows(Square square)
		{
			
			return Rows[(int)((BoardSquare)square).Row];
		}

		public static ulong FillFromSmaller1(ulong bb)
		{
			return ((bb - 1) ^ bb);
		}
		public static ulong GetHigherMovesDiagonal(ulong dd, ulong allpieces)
		{
			var ss = PiecesInLine(dd, allpieces);
			if (ss == 0) return dd;
			return ((~FillFromSmaller1(ss) << 1) & dd) ^ dd;
		}
		public static ulong GetLowerMovesDiagonal(ulong dd, ulong allpieces)
		{
			var ss = PiecesInLine(dd, allpieces);
			if (ss == 0) return dd;
			return ((FillFromBigger1(ss) >> 1) & dd) ^ dd;
		}

		public static ulong GetSudEstOrtogonal(ulong dd, ulong allpieces)
		{
			var ss = (dd & allpieces);
			if (ss == 0) return dd;
			return ((FillFromBigger1(ss) >> 1) & dd) ^ dd;
		}

		public static ulong GetNordOvestOrtogonal(ulong dd, ulong allpieces)
		{
			var ss = PiecesInLine(dd, allpieces);
			if (ss == 0) return dd;
			return FillFromSmaller1(ss) & dd;
		}


		public static ulong PiecesInLine(ulong line, ulong allpieces) {
			var ss = (line & allpieces);
			return ss;
		}


		public static ulong FillFromBigger1(ulong bb)
		{
			bb |= bb >> 32;
			bb |= bb >> 16;
			bb |= bb >> 8;
			bb |= bb >> 4;
			bb |= bb >> 2;
			bb |= bb >> 1;
			return bb;
		}

	}

	public struct MovesHashKey {
		public Square Square;
		public ulong Allied;
		public ulong Enemies;
	}
}
