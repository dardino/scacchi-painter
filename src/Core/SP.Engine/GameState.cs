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
		public BitBoard Allied { get { return BitBoardByColor[AlliedColor] | BitBoardByColor[PieceColors.Neutral]; } }
		public BitBoard Enemies { get { return BitBoardByColor[EnemiesColor]; } }
		public BitBoard All { get { return BitBoardByColor[PieceColors.Black] | BitBoardByColor[PieceColors.White] | BitBoardByColor[PieceColors.Neutral]; } }

		public Dictionary<PieceColors, BitBoard> BitBoardByColor = new Dictionary<PieceColors, BitBoard> {
			{ PieceColors.Black   , BitBoard.FromRowBytes() },
			{ PieceColors.White   , BitBoard.FromRowBytes() },
			{ PieceColors.Neutral , BitBoard.FromRowBytes() }
		};

		internal bool IsPiecePinned(Square pos)
		{
			throw new NotImplementedException("Is Piece Pinned is not implemented");
		}

		public BitBoard UnderAttackCells = 0;
		public BitBoard AttackingCells = 0;

		public bool IsSquareUnderAttack(Square s)
		{
			return (UnderAttackCells & (ulong)s.ToSquareBits()) > 0;
		}

		public Move? LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
		public ulong AlliedRocks = 0; // bitboard for castling check
		public PieceColors MoveTo = PieceColors.White;
		public List<Type> AvailablePromotionsTypes = new List<Type> {
			typeof(Pieces.Pawn),
			typeof(Pieces.Bishop),
			typeof(Pieces.Horse),
			typeof(Pieces.Rock),
			typeof(Pieces.Queen)
		};
		private Board board;


		public decimal MaxDepth { get { return board.Stipulation.Depth; } }

		private decimal ActualDepth { get; set; }

		public void UpdateGameState()
		{
			BitBoardByColor[PieceColors.White] = 0;
			BitBoardByColor[PieceColors.Black] = 0;
			BitBoardByColor[PieceColors.Neutral] = 0;
			UnderAttackCells = 0;
			AttackingCells = 0;

			for (var i = 0; i < 64; i++)
			{
				var s = (Square)i;
				var x = (ulong)s.ToSquareBits();
				var p = board.GetPiece(s) as EnginePiece;
				if (p == null) continue;
				BitBoardByColor[p.Color] |= x;
				if (p.Color == PieceColors.Neutral || p.Color == MoveTo)
				{
					var m = p.GetMovesFromPosition(s, this);
					AttackingCells |= m;
				}
				if (p.Color != MoveTo)
				{
					var m = p.GetAttackingSquares(s, this);
					UnderAttackCells |= m;
				}
			}
		}


		public PieceColors AlliedColor { get { return MoveTo; } }
		public PieceColors EnemiesColor { get { return MoveTo == PieceColors.White ? PieceColors.Black : PieceColors.White; } }

		internal static GameState FromBoard(Board board)
		{
			var gs = new GameState
			{
				board = board
			};
			for (int c = 0; c < 64; c++)
			{
				var s = (Square)c;
				var ex = gs.board.GetPiece(s);
				var p = EnginePiece.FromPieceBase(ex);
				gs.board.PlacePieceOnBoard(s, p);
			}
			gs.MoveTo = gs.board.Stipulation.StartingMoveColor;
			gs.ActualDepth = gs.MaxDepth;
			gs.UpdateGameState();
			return gs;
		}
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


		public IEnumerable<Move> GetMoves()
		{
			for (int c = 0; c < 64; c++)
			{
				var s = (Square)c;
				if (IsPiecePinned(s)) yield break;

				if (board.GetPiece(s) is EnginePiece p && (p.Color == MoveTo || p.Color == PieceColors.Neutral))
				{
					foreach (var item in p.GetMoves(s, this))
					{
						yield return item;
					}
				}
			}
		}
	}
}