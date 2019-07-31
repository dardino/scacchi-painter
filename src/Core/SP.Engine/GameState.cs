using SP.Core;
using SP.Core.Utils;
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

    public static class GameStateStatic
    {
        public static CancellationToken GlobalCancellationToken;

        public static bool IsCheckMate(ref GameState game)
        {
            return game.Moves != null && !game.Moves.Any() && IsCheck(ref game);
        }
        public static bool IsCheckMate(ref GameState state, ref HalfMove move)
        {
            var clone = new GameState();
            CloneTo(state, clone);
            ApplyMove(clone, move);
            return IsCheckMate(ref clone);
        }
        public static bool IsCheck(ref GameState game)
        {
            return IsSquareUnderAttack(ref game, KingPosition(ref game));
        }
        public static bool IsCheckAfter(ref GameState game, HalfMove move)
        {
            var clone = new GameState();
            CloneTo(game, clone);
            ApplyMove(clone, move);
            // è scacco se una volta applicata la mossa il re nemico è sotto scacco
            return IsCheck(ref clone);
        }
        internal static Square KingPosition(ref GameState game, PieceColors? kingColor = null)
        {
            if (!kingColor.HasValue) kingColor = game.MoveTo;
            return (Square)Array.IndexOf(game.SquaresOccupation, game.SquaresOccupation.FirstOrDefault(f => f != null && f.Color == kingColor && f.IsKing));
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
                BoardUtils.PlacePieceOnBoard(gs.Board, s, p);
            }
            gs.MoveTo = gs.Board.Stipulation.StartingMoveColor;
            gs.ActualDepth = 0;
            UpdateGameState(ref gs);
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
            Array.Copy(origin.SquaresOccupation        , destination.SquaresOccupation        , 64);
            Array.Copy(origin.UnderEnemiesAttackByPiece, destination.UnderEnemiesAttackByPiece, 64);
            Array.Copy(origin.UnderAlliedAttackByPiece , destination.UnderAlliedAttackByPiece , 64);
        }

        public static GameState GetCloneOf(GameState gs)
        {
            var n = new GameState();
            CloneTo(gs, n);
            return n;
        }

        internal static void ApplyMove(GameState game, HalfMove move)
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
            GameStateStatic.UpdateGameState(ref game);
            // se la mossa ha "sottomosse" le eseguo
            if (move.SubSequentialMoves != null)
            {
                // ma non devo variare la profondità
                var depth = game.ActualDepth;
                foreach (var subMove in move.SubSequentialMoves)
                {
                    ApplyMove(game, subMove);
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
            return game.Rules.All(r =>
            {
                return r.IsMoveValid(game, item);
            });
        }

        public static void UpdateGameState(ref GameState game)
        {
            game.Moves = null;
            game.BitBoardByColor[PieceColors.White] = 0;
            game.BitBoardByColor[PieceColors.Black] = 0;
            game.BitBoardByColor[PieceColors.Neutral] = 0;

            for (var u = 0; u < 64; u++)
            {
                game.UnderEnemiesAttackByPiece[u] = 0;
                game.UnderAlliedAttackByPiece[u] = 0;
            }

            if (GlobalCancellationToken.IsCancellationRequested) return;

            for (var u = 0; u < 64; u++)
            {
                var cell = game.Board.Cells[u];
                var s = cell.Square;
                var p = game.Board.GetPiece(s) as EnginePiece;
                game.SquaresOccupation[(Int32)s] = p;
                if (p == null) continue;
                var x = s.ToSquareBits();
                game.BitBoardByColor[p.Color] |= x;
            }

            if (GlobalCancellationToken.IsCancellationRequested) return;

            for (var u = 0; u < 64; u++)
            {
                var cell = game.Board.Cells[u];
                var s = cell.Square;
                if (!cell.Occupied || !(game.Board.GetPiece(s) is EnginePiece p)) continue;
                if (p.Color == PieceColors.Neutral || p.Color == game.MoveTo)
                {
                    var m = p.GetMovesFromPosition(s, game);
                    game.UnderAlliedAttackByPiece[(int)s] = m;
                }
                if (p.Color != game.MoveTo)
                {
                    var m = p.GetAttackingSquares(s, game);
                    game.UnderEnemiesAttackByPiece[(int)s] = m;
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
        internal void SetCancellationToken(CancellationToken token)
        {
            GameStateStatic.GlobalCancellationToken = token;
        }

        public BitBoard Allied => BitBoardByColor[AlliedColor] | BitBoardByColor[PieceColors.Neutral];
        public BitBoard Enemies => BitBoardByColor[EnemiesColor];
        public BitBoard All => BitBoardByColor[PieceColors.Black] | BitBoardByColor[PieceColors.White] | BitBoardByColor[PieceColors.Neutral];

        internal BitBoard BitBoardPawnEP;

        public Dictionary<PieceColors, BitBoard> BitBoardByColor = new Dictionary<PieceColors, BitBoard> {
            { PieceColors.Black   , BitBoardUtils.FromRowBytes() },
            { PieceColors.White   , BitBoardUtils.FromRowBytes() },
            { PieceColors.Neutral , BitBoardUtils.FromRowBytes() }
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