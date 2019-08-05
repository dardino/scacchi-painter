using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BitBoard = System.UInt64;

namespace SP.Engine.Pieces
{
	[Figurine(PieceFigurine.King)]
	[PieceName("K")]
	public class King : EnginePiece
	{
		static ulong movesFromB2 = 0xE0A0E0;
		static int b2Index = (int)BoardSquare.GetSquareIndex(Columns.ColB, Rows.Row2);
		static Dictionary<PieceColors, CastlingIndexes[]> castlingByColor => new Dictionary<PieceColors, CastlingIndexes[]> {
			{ PieceColors.Black, new CastlingIndexes[] { CastlingIndexes.ooo, CastlingIndexes.oo } },
			{ PieceColors.White, new CastlingIndexes[] { CastlingIndexes.OOO, CastlingIndexes.OO } }
		};

		static Dictionary<CastlingIndexes, BitBoard> CastlingBB => new Dictionary<CastlingIndexes, BitBoard>
		{
			{ CastlingIndexes.OOO, BitBoardUtils.FromRowBytes(Row1: 0b00100000) },
			{ CastlingIndexes.OO , BitBoardUtils.FromRowBytes(Row1: 0b00000010) },
			{ CastlingIndexes.ooo, BitBoardUtils.FromRowBytes(Row8: 0b00100000) },
			{ CastlingIndexes.oo , BitBoardUtils.FromRowBytes(Row8: 0b00000010) }
		};
		static Dictionary<CastlingIndexes, BitBoard> CastlingNotUnderCheck => new Dictionary<CastlingIndexes, BitBoard>
		{
			{ CastlingIndexes.OOO, BitBoardUtils.FromRowBytes(Row1: 0b00111000) },
			{ CastlingIndexes.OO , BitBoardUtils.FromRowBytes(Row1: 0b00001110) },
			{ CastlingIndexes.ooo, BitBoardUtils.FromRowBytes(Row8: 0b00111000) },
			{ CastlingIndexes.oo , BitBoardUtils.FromRowBytes(Row8: 0b00001110) }
		};
		static Dictionary<CastlingIndexes, BitBoard> CastlingFreeCells => new Dictionary<CastlingIndexes, BitBoard>
		{
			{ CastlingIndexes.OOO, BitBoardUtils.FromRowBytes(Row1: 0b01110000) },
			{ CastlingIndexes.OO , BitBoardUtils.FromRowBytes(Row1: 0b00000110) },
			{ CastlingIndexes.ooo, BitBoardUtils.FromRowBytes(Row8: 0b01110000) },
			{ CastlingIndexes.oo , BitBoardUtils.FromRowBytes(Row8: 0b00000110) }
		};
		static Dictionary<CastlingIndexes, BitBoard> CastlingAlliedRockPos => new Dictionary<CastlingIndexes, BitBoard>
		{
			{ CastlingIndexes.OOO, BitBoardUtils.FromRowBytes(Row1: 0b10000000) },
			{ CastlingIndexes.OO , BitBoardUtils.FromRowBytes(Row1: 0b00000001) },
			{ CastlingIndexes.ooo, BitBoardUtils.FromRowBytes(Row8: 0b10000000) },
			{ CastlingIndexes.oo , BitBoardUtils.FromRowBytes(Row8: 0b00000001) }
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

		public override ulong GetAttackingSquares(Square s, GameState g)
		{
			int c = (int)s - b2Index;
			var m2clone = movesFromB2;
			if (c != 0)
			{
				var col = ((BoardSquare)s).Column;
				if (c < 0) m2clone = m2clone >> (c * -1);
				if (c > 0) m2clone = m2clone << c;
				if (col == Columns.ColA) m2clone &= 0xFEFEFEFEFEFEFEFE;
				if (col == Columns.ColH) m2clone &= 0x7F7F7F7F7F7F7F7F;
			}

			var moves = ((g.Allied & m2clone) ^ m2clone);
			return moves;
		}

		public override ulong GetMovesFromPosition(Square fromSq, GameState gameState)
		{
			var moves = GetAttackingSquares(fromSq, gameState);

			if (gameState.CastlingAllowed.Any(a => a) 
				&& IsMyStartingSquare(fromSq)
			) {
				var idxs = castlingByColor[Color];
				foreach (var castling in idxs)
				{
					if (!gameState.CastlingAllowed[(int)castling] // non è più possibile arroccare
						|| (gameState.All & CastlingFreeCells[castling]) != 0 // la linea di arrocco è occupata
						|| (gameState.UnderAttackCells & CastlingNotUnderCheck[castling]) != 0 // le case interessate dall'arrocco sono sotto attacco
						|| (gameState.AlliedRocks & CastlingAlliedRockPos[castling]) != CastlingAlliedRockPos[castling] // le mie torri non sono al posto giusto
						) continue;
					moves |= CastlingBB[castling];
				}
			}
			return moves;
		}

		public override HalfMove[] GetSubSequentialMoves(Square from, Square to, GameState gInfo)
		{
			if (from == Square.E1 && to == Square.C1) return new HalfMove[] { new HalfMove { DestinationSquare = Square.D1, SourceSquare = Square.A1, Piece = gInfo.Board.GetPiece(Square.A1) as Rock } };
			if (from == Square.E1 && to == Square.G1) return new HalfMove[] { new HalfMove { DestinationSquare = Square.F1, SourceSquare = Square.H1, Piece = gInfo.Board.GetPiece(Square.H1) as Rock } };
			if (from == Square.E8 && to == Square.C8) return new HalfMove[] { new HalfMove { DestinationSquare = Square.D8, SourceSquare = Square.A8, Piece = gInfo.Board.GetPiece(Square.A8) as Rock } };
			if (from == Square.E8 && to == Square.G8) return new HalfMove[] { new HalfMove { DestinationSquare = Square.F8, SourceSquare = Square.H8, Piece = gInfo.Board.GetPiece(Square.H8) as Rock } };
			else return null;
		}



	}
}
