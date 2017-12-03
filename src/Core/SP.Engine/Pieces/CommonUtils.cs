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

		public static ulong GetBotLeft2TopRightDiagonal(Square s)
		{
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

		public static ulong GetDiagonals(Square s)
		{
			return GetTopLeft2BottomRight(s) | GetBotLeft2TopRightDiagonal(s);
		}


		public static ulong[] Cols = new ulong[] {
			0x0101010101010101, // H
			0x0202020202020202, // G
			0x0404040404040404, // F
			0x0808080808080808, // E
			0x1010101010101010, // D
			0x2020202020202020, // C
			0x4040404040404040, // B
			0x8080808080808080  // A
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


		public static ulong PiecesInLine(ulong line, ulong allpieces)
		{
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

		public static ulong GetDiagonalMoves(Square s, ulong allied, ulong enemies)
		{
			var sqb = (ulong)s.ToSquareBits();
			var alldiag = GetDiagonals(s) ^ sqb;
			enemies = enemies & alldiag;
			allied = allied & alldiag;
			var allpieces = (allied | enemies);
			if (allpieces == 0) return alldiag;

			var mydiagA = GetBotLeft2TopRightDiagonal(s) ^ sqb;
			var mydiagB = GetTopLeft2BottomRight(s) ^ sqb;

			var south = (sqb - 1);
			var north = ~south << 1;

			var se = GetLowerMovesDiagonal(south & mydiagA, allpieces); //mosse possibili in S-E
			var nw = GetHigherMovesDiagonal(north & mydiagA, allpieces); //mosse possibili in N-W
			var sw = GetLowerMovesDiagonal(south & mydiagB, allpieces); //mosse possibili in S-W
			var ne = GetHigherMovesDiagonal(north & mydiagB, allpieces); //mosse possibili in N-E

			return (nw | ne | sw | se | allied) ^ allied; // tolgo gli alleati e lascio le catture
		}

		public static ulong GetOrthogonalMoves(Square s, ulong allied, ulong enemies)
		{
			var r = (int)((BoardSquare)s).Row;
			var c = (int)((BoardSquare)s).Column;
			var sb = (ulong)s.ToSquareBits();

			var trav = (0xFFul << (r * 8)) ^ sb;
			var col = (0x101010101010101ul << c) ^ sb;
			var all = (allied | enemies) & (trav | col);

			var south = (sb - 1);
			var north = ~(south) ^ sb;

			ulong m1 = GetSudEstOrtogonal(south & col, all); //mosse possibili a sud
			ulong m2 = GetNordOvestOrtogonal(north & col, all); //mosse possibili a nord
			ulong m3 = GetSudEstOrtogonal(south & trav, all); //mosse possibili a est
			ulong m4 = GetNordOvestOrtogonal(north & trav, all); //mosse possibili a ovest
			ulong sum = (m1 | m2 | m3 | m4);
			return (sum & allied) ^ sum; // tolgo gli alleati e lascio le catture
		}


	}

	public struct MovesHashKey
	{
		public Square Square;
		public ulong Allied;
		public ulong Enemies;
	}
}
