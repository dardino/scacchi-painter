using SP.Core;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

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

		public BitBoard Allied {
			get {
				return BitBoardByColor[AlliedColor] | BitBoardByColor[PieceColors.Neutral];
			}
		}

		internal void ApplyMove(HalfMove move)
		{
			LastMove = move;
			// sposto il pezzo:
			MovePiece(move);
			// ogni mossa è una mezza mossa:
			ActualDepth += .5m;
			// cambio colore del giocatore di turno
			MoveTo = MoveTo == PieceColors.Black ? PieceColors.White : PieceColors.Black;
			// aggiorno il gamestate:
			UpdateGameState();
			// se la mossa ha "sottomosse" le eseguo
			if (move.SubSequentialMoves != null)
			{
				// ma non devo variare la profondità
				var depth = ActualDepth;
				foreach (var subMove in move.SubSequentialMoves)
				{
					ApplyMove(subMove);
				}
				ActualDepth = depth;
			}
		}

		private void MovePiece(HalfMove move)
		{
			Board.PlacePieceOnBoard(move.SourceSquare, null);
			Board.PlacePieceOnBoard(move.DestinationSquare, move.Piece);
		}

		internal void SetCancellationToken(CancellationToken token)
		{
			this.ct = token;
		}

		public bool IsCheckMate(HalfMove move)
		{
			var clone = new GameState();
			clone.CloneFrom(this);
			clone.ApplyMove(move);
			return clone.IsCheckMate();
		}
		public bool IsCheckMate()
		{
			return moves != null && !moves.Any() && MyKingUnderAttack();
		}

		bool MyKingUnderAttack()
		{
			return IsSquareUnderAttack(KingPosition(MoveTo));
		}

		internal bool IsCheck()
		{
			return MyKingUnderAttack();
		}

		public bool IsCheck(HalfMove move)
		{
			var clone = new GameState();
			clone.CloneFrom(this);
			clone.ApplyMove(move);
			// è scacco se una volta applicata la mossa il re nemico è sotto scacco
			return (clone.IsSquareUnderAttack(clone.KingPosition(move.Piece.Color.Opposite())));
		}

		public Square KingPosition(PieceColors kingColor)
		{
			return (Square)Array.IndexOf(SquaresOccupation, SquaresOccupation.FirstOrDefault(f => f != null && f.Color == kingColor && f.IsKing));
		}

		public BitBoard Enemies { get { return BitBoardByColor[EnemiesColor]; } }

		internal BitBoard BitBoardPawnEP;

		public BitBoard All { get { return BitBoardByColor[PieceColors.Black] | BitBoardByColor[PieceColors.White] | BitBoardByColor[PieceColors.Neutral]; } }

		internal GameState GetAfterMove(HalfMove mTree)
		{
			var m = GetCloneOf(this);
			m.ApplyMove(mTree);
			return m;
		}

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

		public HalfMove? LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
		public ulong AlliedRocks
		{
			get
			{
				var lista = Board.Cells
					.Where(c => c.Piece != null && c.Piece.Name == "R" && c.Piece.Color == MoveTo)
					.Select(c => (ulong)c.Square.ToSquareBits()).ToList();
				if (lista.Count>0)
					return lista.Aggregate((a, b) => a | b);
				return 0;
			}
		}
		public PieceColors MoveTo = PieceColors.White;
		public List<Type> AvailablePromotionsTypes = new List<Type> {
			typeof(Pieces.Bishop),
			typeof(Pieces.Horse),
			typeof(Pieces.Rock),
			typeof(Pieces.Queen)
		};
		public Board Board { get; private set; }

		public decimal MaxDepth { get { return Board.Stipulation.Depth; } }
		public decimal ActualDepth { get; private set; } = 0;

		private CancellationToken ct;
		public void UpdateGameState()
		{
			moves = null;
			BitBoardByColor[PieceColors.White] = 0;
			BitBoardByColor[PieceColors.Black] = 0;
			BitBoardByColor[PieceColors.Neutral] = 0;

			for (var u = 0; u < 64; u++)
			{
				UnderEnemiesAttackByPiece[u] = 0;
				UnderAlliedAttackByPiece[u] = 0;
			}

			if (ct.IsCancellationRequested) return;

			for (var u = 0; u < 64; u++)
			{
				var cell = Board.Cells[u];
				var s = cell.Square;
				var p = Board.GetPiece(s) as EnginePiece;
				SquaresOccupation[(Int32)s] = p;
				if (p == null) continue;
				var x = (ulong)s.ToSquareBits();
				BitBoardByColor[p.Color] |= x;
			}

			if (ct.IsCancellationRequested) return;

			for (var u = 0; u < 64; u++)
			{
				var cell = Board.Cells[u];
				var s = cell.Square;
				if (!(Board.GetPiece(s) is EnginePiece p)) continue;
				if (p.Color == PieceColors.Neutral || p.Color == MoveTo)
				{
					var m = p.GetMovesFromPosition(s, this);
					UnderAlliedAttackByPiece[(Int32)s] = m;
				}
				if (p.Color != MoveTo)
				{
					var m = p.GetAttackingSquares(s, this);
					UnderEnemiesAttackByPiece[(Int32)s] = m;
				}
			};

			BitBoardPawnEP = 0;
			if (LastMove.HasValue && LastMove.Value.Piece.IsPawn && Engine.Pieces.Pawn.IsStartingSquare(LastMove.Value.SourceSquare, LastMove.Value.Piece.Color))
			{
				BitBoardPawnEP = LastMove.Value.Piece.Color == PieceColors.Black ?
					((ulong)LastMove.Value.SourceSquare.ToSquareBits() >> 8) :
					((ulong)LastMove.Value.SourceSquare.ToSquareBits() << 8);
			}

		}


		public PieceColors AlliedColor { get { return MoveTo; } }
		public PieceColors EnemiesColor { get { return MoveTo == PieceColors.White ? PieceColors.Black : PieceColors.White; } }

		internal static GameState FromBoard(Board board)
		{
			var gs = new GameState(new StandardOrtodoxRule())
			{
				Board = board
			};
			for (int c = 0; c < 64; c++)
			{
				var s = (Square)c;
				var ex = gs.Board.GetPiece(s);
				var p = EnginePiece.FromPieceBase(ex);
				gs.Board.PlacePieceOnBoard(s, p);
			}
			gs.MoveTo = gs.Board.Stipulation.StartingMoveColor;
			gs.ActualDepth = 0;
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



		private IEnumerable<HalfMove> GetMoves()
		{
			for (int c = 0; c < 64; c++)
			{
				var s = (Square)c;

				if (Board.GetPiece(s) is EnginePiece p && (p.Color == MoveTo || p.Color == PieceColors.Neutral))
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
		private bool MoveIsValid(HalfMove item)
		{
			return rules.All(r => r.IsMoveValid(this, item));
		}

		internal void CloneFrom(GameState gs)
		{
			ActualDepth = gs.ActualDepth;
			Board = gs.Board.Clone();

			rules = new ChessRule[gs.rules.Length];
			gs.rules.CopyTo(rules, 0);
			AvailablePromotionsTypes = gs.AvailablePromotionsTypes;
			gs.CastlingAllowed.CopyTo(CastlingAllowed, 0);
			LastMove = gs.LastMove?.Clone();
			MoveTo = gs.MoveTo;

			UpdateGameState();
		}

		public ChessRule[] Rules => rules;

		private IEnumerable<HalfMove> moves;
		public IEnumerable<HalfMove> Moves()
		{
			if (moves == null)
				moves = GetMoves();
			return moves;
		}

		private ChessRule[] rules;
		public GameState(params ChessRule[] rules)
		{
			this.rules = rules;
		}

		public static GameState GetCloneOf(GameState gs)
		{
			var n = new GameState();
			n.CloneFrom(gs);
			return n;
		}
	}
}