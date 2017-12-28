using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.King)]
	public class King : EnginePiece
	{
		static ulong movesFromB2 = 0xE0A0E0;
		static int b2Index = (int)BoardSquare.GetSquareIndex(Columns.ColB, Rows.Row2);
		static Dictionary<PieceColors, CastlingIndexes[]> castlingByColor = new Dictionary<PieceColors, CastlingIndexes[]> {
			{ PieceColors.Black, new CastlingIndexes[] { CastlingIndexes.ooo, CastlingIndexes.oo } },
			{ PieceColors.White, new CastlingIndexes[] { CastlingIndexes.OOO, CastlingIndexes.OO } }
		};

		static Dictionary<CastlingIndexes, BitBoard> CastlingBB = new Dictionary<CastlingIndexes, BitBoard>
		{
			{ CastlingIndexes.OOO, BitBoard.FromRowBytes(Row1: 0b00100000) },
			{ CastlingIndexes.OO , BitBoard.FromRowBytes(Row1: 0b00000010) },
			{ CastlingIndexes.ooo, BitBoard.FromRowBytes(Row8: 0b00100000) },
			{ CastlingIndexes.oo , BitBoard.FromRowBytes(Row8: 0b00000010) }
		};
		static Dictionary<CastlingIndexes, BitBoard> CastlingNotUnderCheck = new Dictionary<CastlingIndexes, BitBoard>
		{
			{ CastlingIndexes.OOO, BitBoard.FromRowBytes(Row1: 0b10111000) },
			{ CastlingIndexes.OO , BitBoard.FromRowBytes(Row1: 0b00001111) },
			{ CastlingIndexes.ooo, BitBoard.FromRowBytes(Row8: 0b10111000) },
			{ CastlingIndexes.oo , BitBoard.FromRowBytes(Row8: 0b00001111) }
		};

		protected bool IsMyStartingSquare(Square s) {
			return (Color == PieceColors.White && s == Square.E1) ||
					(Color == PieceColors.Black && s== Square.E8);
		}

		public override ulong GetCapturesFromPosition(Square s, GameState gameState)
		{
			ulong moves = GetMovesFromPosition(s, gameState);
			return (moves & gameState.Enemies);
		}

		public override ulong GetMovesFromPosition(Square fromSq, GameState gameState)
		{
			int c = (int)fromSq - b2Index;
			var m2clone = movesFromB2;
			if (c != 0)
			{
				var col = ((BoardSquare)fromSq).Column;
				if (c < 0) m2clone = m2clone >> (c * -1);
				if (c > 0) m2clone = m2clone << c;
				if (col == Columns.ColA) m2clone &= 0xFEFEFEFEFEFEFEFE;
				if (col == Columns.ColH) m2clone &= 0x7F7F7F7F7F7F7F7F;
			}
			var moves = (gameState.Allied & m2clone) ^ m2clone;
			if (gameState.CastlingAllowed.Any(a => a) 
				&& IsMyStartingSquare(fromSq)
			) {
				var idxs = castlingByColor[Color];
				foreach (var castling in idxs)
				{
					if (!gameState.CastlingAllowed[(int)castling] 
						|| (gameState.UnderAttackCells & CastlingNotUnderCheck[castling]) != 0) continue;
					moves |= CastlingBB[castling];
				}
			}
			return moves;
		}

		public override bool IsAttackingSquare(Square fromSquare, Square attackingSquare, GameState gameState)
		{
			var moves = GetMovesFromPosition(fromSquare, gameState);
			return ((ulong)Math.Pow(2, (int)attackingSquare) & moves) > 0;
		}
	}
}
