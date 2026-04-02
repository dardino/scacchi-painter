using SP.Core;
using SP.Core.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using BitBoard = System.UInt64;

namespace SP.Engine
{
	public enum CastlingIndexes
	{
		OO = 0,
		OOO = 1,
		oo = 2,
		ooo = 3
	}

	public static class GameStateStatic
	{

		public static bool IsCheckMate(ref GameState game)
		{
			return game.Moves != null && !game.Moves.Any() && IsCheck(ref game);
		}
		public static bool IsCheckMate(ref GameState state, ref HalfMove move, CancellationToken ct)
		{
			var clone = new GameState();
			CloneTo(state, clone);
			ApplyMove(clone, move, ct);
			return IsCheckMate(ref clone);
		}
		public static bool IsCheck(ref GameState game)
		{
			return IsSquareUnderAttack(ref game, KingPosition(ref game));
		}
		public static bool IsCheckAfter(ref GameState game, HalfMove move, CancellationToken ct)
		{
			var clone = new GameState();
			CloneTo(game, clone);
			ApplyMove(clone, move, ct);
			// è scacco se una volta applicata la mossa il re nemico è sotto scacco
			return IsCheck(ref clone);
		}
		internal static Square KingPosition(ref GameState game, PieceColors? kingColor = null)
		{
			if (!kingColor.HasValue) kingColor = game.MoveTo;
			foreach (var c in game.Board.Cells)
			{
				if (c.Occupied && c.Piece.Color == kingColor && ((EnginePiece)c.Piece).IsKing) 
				return c.Square;
			}
			return Square.H1;
		}

		internal static IEnumerable<HalfMove> GetMoves(GameState state)
		{
			for (int c = 0; c < 64; c++)
			{
				var s = (Square)c;
				if (state.Board.GetPiece(s) is EnginePiece p && (p.Color == state.MoveTo || p.Color == PieceColors.Neutral))
				{
					foreach (var item in p.GetMoves(s, state))
					{
						if (GameStateStatic.MoveIsValid(state, item))
							yield return item;
					}
				}
			}
		}

		internal static void Analyze(ref GameState state)
		{
			state.Moves = GetMoves(state);
		}

		internal static GameState FromBoard(Board board, CancellationToken ct)
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
				BoardUtils.PlacePieceOnBoard(gs.Board, s, p);
			}
			gs.MoveTo = gs.Board.Stipulation.StartingMoveColor;
			gs.ActualDepth = 0;
			UpdateGameState(gs, ct);
			return gs;
		}
		public static bool IsSquareUnderAttack(ref GameState state, Square s)
		{
			return (state.UnderAttackCells & s.ToSquareBits()) > 0;
		}
		public static bool IsAttackingSquare(ref GameState state, Square s)
		{
			return (state.AttackingCells & s.ToSquareBits()) > 0;
		}

		internal static void CloneTo(GameState origin, GameState destination)
		{
			destination.ActualDepth = origin.ActualDepth;
			destination.Board = origin.Board.Clone();
			destination.Rules = origin.Rules;
			destination.AvailablePromotionsTypes = origin.AvailablePromotionsTypes;
			for (var a = 0; a < 4; a++) destination.CastlingAllowed[a] = origin.CastlingAllowed[a];
			if (origin.LastMove != null) destination.LastMove = origin.LastMove.Clone();
			destination.MoveTo = origin.MoveTo;
			destination.BitBoardByColor[PieceColors.Black] = origin.BitBoardByColor[PieceColors.Black];
			destination.BitBoardByColor[PieceColors.White] = origin.BitBoardByColor[PieceColors.White];
			destination.BitBoardByColor[PieceColors.Neutral] = origin.BitBoardByColor[PieceColors.Neutral];
			destination.BitBoardPawnEP = origin.BitBoardPawnEP;
			Array.Copy(origin.UnderEnemiesAttackByPiece, destination.UnderEnemiesAttackByPiece, 64);
			Array.Copy(origin.UnderAlliedAttackByPiece, destination.UnderAlliedAttackByPiece, 64);
			Array.Copy(origin.MovesByPiece, destination.MovesByPiece, 64);
			destination.UnderAttackCells = origin.UnderAttackCells;
			destination.AttackingCells = origin.AttackingCells;
		}

		public static GameState GetCloneOf(GameState gs)
		{
			var n = new GameState();
			CloneTo(gs, n);
			return n;
		}

		internal static void ApplyMove(GameState game, HalfMove move, CancellationToken ct)
		{
			game.LastMove = move;
			// sposto il pezzo:
			var isCaputre = GameStateStatic.MovePiece(ref game, move);
			game.LastMove.IsCapture = isCaputre;
			// ogni mossa è una mezza mossa:
			game.ActualDepth += .5m;
			// cambio colore del giocatore di turno
			game.MoveTo = game.MoveTo == PieceColors.Black ? PieceColors.White : PieceColors.Black;
			// aggiorno il gamestate:
			GameStateStatic.UpdateGameState(game, ct);
			// se la mossa ha "sottomosse" le eseguo
			if (move.SubSequentialMoves != null)
			{
				// ma non devo variare la profondità
				var depth = game.ActualDepth;
				foreach (var subMove in move.SubSequentialMoves)
				{
					ApplyMove(game, subMove, ct);
				}
				game.ActualDepth = depth;
			}
		}

		/// <summary>
		/// Test if certain move is valid according to ChessRules
		/// </summary>
		/// <param name="item"></param>
		/// <returns></returns>
		private static bool MoveIsValid(GameState game, HalfMove item)
		{
			var isValid = true;
			for (var rx = 0; rx < game.Rules.Length; rx++)
			{
				isValid = game.Rules[rx].IsMoveValid(game, item);
				if (!isValid) break;
			}
			return isValid;
		}

		public static void UpdateGameState(GameState game, CancellationToken GsCt)
		{
			game.Moves = null;
			game.BitBoardByColor[PieceColors.White] = 0ul;
			game.BitBoardByColor[PieceColors.Black] = 0ul;
			game.BitBoardByColor[PieceColors.Neutral] = 0ul;

			game.AttackingCells = 0ul;
			game.UnderAttackCells = 0ul;
			for (var u = 0; u < 64; u++)
			{
				game.UnderEnemiesAttackByPiece[u] = 0;
				game.UnderAlliedAttackByPiece[u] = 0;
				game.MovesByPiece[u] = 0;
			}

			if (GsCt.IsCancellationRequested) return;

			for (var u = 0; u < 64; u++)
			{
				var cell = game.Board.Cells[u];
				var s = cell.Square;
                if (!(game.Board.GetPiece(s) is EnginePiece p)) continue;
                var x = s.ToSquareBits();
				game.BitBoardByColor[p.Color] |= x;
			}

			if (GsCt.IsCancellationRequested) return;

			for (var u = 0; u < 64; u++)
			{
				var cell = game.Board.Cells[u];
				var s = cell.Square;
				int sx = (int)s;
				if (!cell.Occupied || !(game.Board.GetPiece(s) is EnginePiece p)) continue;
				var m = p.GetAttackingSquares(s, game);
				if (p.Color == PieceColors.Neutral || p.Color == game.MoveTo)
				{
					game.MovesByPiece[sx] = p.GetMovesFromPosition(s, game);
					game.UnderAlliedAttackByPiece[sx] = m;
					game.AttackingCells |= m;
				}
				if (p.Color != game.MoveTo)
				{
					game.UnderEnemiesAttackByPiece[sx] = m;
					game.UnderAttackCells |= m;
				}
			};

			game.BitBoardPawnEP = 0;
			if (
				 game.LastMove != null
				 && game.LastMove.Piece.IsPawn
				 && Engine.Pieces.PawnStatic.IsStartingSquare(game.LastMove.SourceSquare, game.LastMove.Piece.Color)
			)
			{
				game.BitBoardPawnEP = game.LastMove.Piece.Color == PieceColors.Black ?
					 (game.LastMove.SourceSquare.ToSquareBits() >> 8) :
					 (game.LastMove.SourceSquare.ToSquareBits() << 8);
			}

		}

		private static bool MovePiece(ref GameState game, HalfMove move)
		{
			BoardUtils.PlacePieceOnBoard(game.Board, move.SourceSquare, null);
			var isCapture = BoardUtils.PlacePieceOnBoard(game.Board, move.DestinationSquare, move.Piece);
			return isCapture;
		}

	}

	public class GameState
	{
		public BitBoard Allied => BitBoardByColor[AlliedColor] | BitBoardByColor[PieceColors.Neutral];
		public BitBoard Enemies => BitBoardByColor[EnemiesColor];
		public BitBoard All => BitBoardByColor[PieceColors.Black] | BitBoardByColor[PieceColors.White] | BitBoardByColor[PieceColors.Neutral];

		internal BitBoard BitBoardPawnEP;

		public Dictionary<PieceColors, BitBoard> BitBoardByColor = new Dictionary<PieceColors, BitBoard> {
				{ PieceColors.Black   , BitBoardUtils.FromRowBytes() },
				{ PieceColors.White   , BitBoardUtils.FromRowBytes() },
				{ PieceColors.Neutral , BitBoardUtils.FromRowBytes() }
		  };

		public BitBoard[] UnderEnemiesAttackByPiece { get; } = new BitBoard[64];
		public BitBoard[] UnderAlliedAttackByPiece { get; } = new BitBoard[64];
		public BitBoard[] MovesByPiece { get; } = new BitBoard[64];
		public IEnumerable<EnginePiece> Pieces => Board.Cells.Where(s => s.Occupied).Select(s => (EnginePiece)s.Piece);
		public BitBoard UnderAttackCells = 0x00;
		public BitBoard AttackingCells = 0x00;


		public HalfMove LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
		public ulong AlliedRocks
		{
			get
			{
				var lista = Board.Cells
					 .Where(c => c.Piece != null && c.Piece.Name == "R" && c.Piece.Color == MoveTo)
					 .Select(c => c.Square.ToSquareBits()).ToList();
				if (lista.Count > 0)
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
		public Board Board { get; set; }


		public decimal MaxDepth { get { return Board.Stipulation.Depth; } }
		public decimal ActualDepth { get; set; } = 0;

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
				MoveTo = moveTo
			};
			gs.BitBoardByColor[PieceColors.Black] = bbe[PieceColors.White];
			gs.BitBoardByColor[PieceColors.Black] = bbe[PieceColors.Black];
			gs.BitBoardByColor[PieceColors.Neutral] = bbe[PieceColors.Neutral];
			return gs;
		}


		internal IEnumerable<HalfMove> Moves { get; set; }

		public bool CanMove => Moves != null && Moves.Any();

		internal ChessRule[] Rules;
		public GameState(params ChessRule[] rules)
		{
			this.Rules = rules;
		}
	}
}
