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

		internal void ApplyMove(Move moveToTest)
		{
			// sposto il pezzo:
			board.PlacePieceOnBoard(moveToTest.SourceSquare, null);
			board.PlacePieceOnBoard(moveToTest.DestinationSquare, moveToTest.Piece);
			// ogni mossa è una mezza mossa:
			ActualDepth += .5m;
			// cambio colore del giocatore di turno
			MoveTo = MoveTo == PieceColors.Black ? PieceColors.White : PieceColors.Black;
			// aggiorno il gamestate:
			UpdateGameState();
		}

		public Square KingPosition(PieceColors kingColor)
		{
			return (Square)Array.IndexOf(SquaresOccupation, SquaresOccupation.FirstOrDefault(f => f != null && f.Color == kingColor && f.IsKing));
		}

		public BitBoard Enemies { get { return BitBoardByColor[EnemiesColor]; } }
		public BitBoard All { get { return BitBoardByColor[PieceColors.Black] | BitBoardByColor[PieceColors.White] | BitBoardByColor[PieceColors.Neutral]; } }
		public Dictionary<PieceColors, BitBoard> BitBoardByColor = new Dictionary<PieceColors, BitBoard> {
			{ PieceColors.Black   , BitBoard.FromRowBytes() },
			{ PieceColors.White   , BitBoard.FromRowBytes() },
			{ PieceColors.Neutral , BitBoard.FromRowBytes() }
		};
		public EnginePiece[] SquaresOccupation { get; } = new EnginePiece[64];
		public BitBoard[] UnderEnemiesAttackByPiece { get; } = new BitBoard[64];
		public BitBoard[] UnderAlliedAttackByPiece { get; } = new BitBoard[64];
		public IEnumerable<EnginePiece> Pieces => SquaresOccupation.Where(s => s is EnginePiece);

		public BitBoard UnderAttackCells
		{
			get
			{
				return UnderEnemiesAttackByPiece.Aggregate((a, b) => a | b);
			}
		}
		public BitBoard AttackingCells
		{
			get
			{
				return UnderAlliedAttackByPiece.Aggregate((a, b) => a | b);
			}
		}

		public bool IsSquareUnderAttack(Square s)
		{
			return (UnderAttackCells & (ulong)s.ToSquareBits()) > 0;
		}
		public bool IsAttackingSquare(Square s)
		{
			return (AttackingCells & (ulong)s.ToSquareBits()) > 0;
		}

		public Move? LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
		public ulong AlliedRocks => board.Cells
			.Where(c => c.Piece != null && c.Piece.Name == "R" && c.Piece.Color == MoveTo)
			.Select(c => (ulong)c.Square.ToSquareBits())
			.Aggregate((a, b) => a | b);
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

		private decimal ActualDepth { get; set; } = 0;

		public void UpdateGameState()
		{
			BitBoardByColor[PieceColors.White] = 0;
			BitBoardByColor[PieceColors.Black] = 0;
			BitBoardByColor[PieceColors.Neutral] = 0;
			UnderEnemiesAttackByPiece.Initialize();

			for (var i = 0; i < 64; i++)
			{
				var s = (Square)i;
				var x = (ulong)s.ToSquareBits();
				var p = board.GetPiece(s) as EnginePiece;
				SquaresOccupation[i] = p;
				if (p == null) continue;
				BitBoardByColor[p.Color] |= x;
				if (p.Color == PieceColors.Neutral || p.Color == MoveTo)
				{
					var m = p.GetMovesFromPosition(s, this);
					UnderAlliedAttackByPiece[i] = m;
				}
				if (p.Color != MoveTo)
				{
					var m = p.GetAttackingSquares(s, this);
					UnderEnemiesAttackByPiece[i] = m;
				}
			}
		}


		public PieceColors AlliedColor { get { return MoveTo; } }
		public PieceColors EnemiesColor { get { return MoveTo == PieceColors.White ? PieceColors.Black : PieceColors.White; } }

		internal static GameState FromBoard(Board board)
		{
			var gs = new GameState(new StandardOrtodoxRule())
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
				MoveTo = moveTo
			};
			gs.BitBoardByColor[PieceColors.Black] = bbe[PieceColors.White];
			gs.BitBoardByColor[PieceColors.Black] = bbe[PieceColors.Black];
			gs.BitBoardByColor[PieceColors.Neutral] = bbe[PieceColors.Neutral];
			return gs;
		}

		public IEnumerable<Move> GetMoves()
		{
			for (int c = 0; c < 64; c++)
			{
				var s = (Square)c;

				if (board.GetPiece(s) is EnginePiece p && (p.Color == MoveTo || p.Color == PieceColors.Neutral))
				{
					foreach (var item in p.GetMoves(s, this))
					{
						if (MoveIsValid(item))
							yield return item;
					}
				}
			}
		}

		/// <summary>
		/// Test if certain move is valid according to ChessRules
		/// </summary>
		/// <param name="item"></param>
		/// <returns></returns>
		private bool MoveIsValid(Move item)
		{
			return rules.All(r => r.IsMoveValid(this, item));
		}

		internal void CloneFrom(GameState gs)
		{
			ActualDepth = gs.ActualDepth;
			AvailablePromotionsTypes = gs.AvailablePromotionsTypes;
			BitBoardByColor = new Dictionary<PieceColors, BitBoard>();
			BitBoardByColor[PieceColors.White  ] = gs.BitBoardByColor[PieceColors.White  ];
			BitBoardByColor[PieceColors.Black  ] = gs.BitBoardByColor[PieceColors.Black  ];
			BitBoardByColor[PieceColors.Neutral] = gs.BitBoardByColor[PieceColors.Neutral];
			board = gs.board.Clone();
			gs.CastlingAllowed.CopyTo(CastlingAllowed, 0);
			LastMove = gs.LastMove?.Clone();
			MoveTo = gs.MoveTo;
			rules = new ChessRule[gs.rules.Length];
			gs.rules.CopyTo(rules, 0);
			UpdateGameState();
		}

		public ChessRule[] Rules => rules;
		private ChessRule[] rules;
		public GameState(params ChessRule[] rules)
		{
			this.rules = rules;
		}
	}
}