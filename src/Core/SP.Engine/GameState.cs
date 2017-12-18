using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Engine
{
	public enum CastlingIndexes
	{
		OO = 0,
		OOO = 1,
		oo = 2,
		ooo = 3
	}

	public class GameState
	{
		public BitBoard Allied { get { return BitBoardByColor[AlliedColor]; } }
		public BitBoard Enemies { get { return BitBoardByColor[EnemiesColor]; } }
		public BitBoard AllBB { get { return BitBoardByColor[PieceColors.Black] | BitBoardByColor[PieceColors.White] | BitBoardByColor[PieceColors.Neutral]; } }

		public Dictionary<PieceColors, BitBoard> BitBoardByColor = new Dictionary<PieceColors, BitBoard> {
			{ PieceColors.Black   , BitBoard.FromRowBytes() },
			{ PieceColors.White   , BitBoard.FromRowBytes() },
			{ PieceColors.Neutral , BitBoard.FromRowBytes() }
		};

		public BitBoard UnderAttackCells = 0;

		public bool IsSquareUnderAttack(Square s)
		{
			return (UnderAttackCells & (ulong)s.ToSquareBits()) > 0;
		}

		public Move? LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
		public ulong AlliedRocks = 0; // bitboard for castling check
		public PieceColors MoveTo = PieceColors.White;

		private Board board;
		internal static GameState FromBoard(Board board)
		{
			var gs = new GameState();
			gs.board = board;
			for (int c = 0; c < 64; c++) {
				var s = (Square)c;
				var p = gs.board.GetPiece(s);
				if (p == null) continue;
				gs.BitBoardByColor[p.Color] |= (ulong)s.ToSquareBits();
			}
			return gs;
		}

		public PieceColors AlliedColor { get { return MoveTo; } }
		public PieceColors EnemiesColor { get { return MoveTo == PieceColors.White ? PieceColors.Black : PieceColors.White; } }

		internal static GameState FromOnlyEnemies(ulong enemies, PieceColors moveTo)
		{
			var bbe = new Dictionary<PieceColors, BitBoard>
			{
				{ moveTo == PieceColors.Black ? PieceColors.Black : PieceColors.White, 0 },
				{ moveTo == PieceColors.Black ? PieceColors.White : PieceColors.Black, enemies },
				{ PieceColors.Neutral, 0 }
			};
			var gs = new GameState()
			{
				MoveTo = moveTo,
				BitBoardByColor = bbe
			};
			return gs;
		}
	}
}