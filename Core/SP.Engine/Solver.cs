using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SP.Engine
{
    /// <summary>
    /// Classe per risolvere i problemi di scacchi
    /// </summary>
    public class Solver: IDisposable
    {
        private GameState initialGameState = null;
        private CancellationTokenSource tokenSource;
        private Task<ConcurrentBag<MoveTree>> taskSolver;
        private ConcurrentBag<MoveTree> Moves { get; set; } = new ConcurrentBag<MoveTree>();

        public TaskStatus State => taskSolver?.Status ?? TaskStatus.WaitingToRun;

        public static Solver GetSolver(GameState startGame, CancellationTokenSource ct)
        {
            return new Solver()
            {
                initialGameState = startGame,
                tokenSource = ct
            };
        }

        private Solver() { }

        public Task<ConcurrentBag<MoveTree>> Solve()
        {
            if (initialGameState.Board == null) return null;
            if (State != TaskStatus.Running)
            {
                return InternalSolve();
            }
            else
            {
                Log("You cannot call Start method more than once! Call Stop() then call Start() again", true);
                return null;
            }
        }

        private Task<ConcurrentBag<MoveTree>> InternalSolve()
        {
#if DEBUG
            var stopwatch = Stopwatch.StartNew();
            Debug.WriteLine($"solver creation");
#endif
            taskSolver = Task.Run(() =>
            {
                if (tokenSource.IsCancellationRequested)
                {
                    return Moves;
                }
                var movefound = FindMoves(initialGameState);
                if (movefound == null)
                    return Moves;

                foreach (var move in movefound)
                {
                    // if (tokenSource.IsCancellationRequested) { cloop.Break(); return; }
                    Moves.Add(move);
                    // Log(move.ToString(), true);
                };

                return Moves;
            }, tokenSource.Token);
#if DEBUG
            Debug.WriteLine($"elapsed time: {stopwatch.Elapsed}");
#endif
            return taskSolver;
        }

        private void FindMovesOfMove(GameState gs, MoveTree mTree)
        {
            GameState subg = GameStateStatic.GetCloneOf(gs);
            GameStateStatic.ApplyMove(subg, mTree.Move, tokenSource.Token);

            var mosse = FindMoves(subg);
            if (mosse != null && mosse.Count > 0)
            {
                mTree.ChildMoves = mosse.ToArray();
            }
            else
            {
                mTree.Check = GameStateStatic.IsCheck(ref subg);
                mTree.CheckMate = mTree.Check;
                mTree.StaleMate = !mTree.CheckMate;
            }
        }

        private ConcurrentBag<MoveTree> FindMoves(GameState gs)
        {
            if (gs.MaxDepth <= gs.ActualDepth) return null;
            GameStateStatic.Analyze(ref gs);
            var gsml = gs.Moves;
            ConcurrentBag<MoveTree> ml = new ConcurrentBag<MoveTree>();
            var loop = Parallel.ForEach(gsml, (m) =>
            {
                var mTree = new MoveTree(m, gs.ActualDepth + .5m);
                FindMovesOfMove(gs, mTree);
                ml.Add(mTree);
            });

            return ml;
        }

        private void Log(string v, bool newLine)
        {
            Console.Write(v);
            if (newLine)
                Console.WriteLine();
#if DEBUG
            Debug.Write(v);
            if (newLine)
                Debug.WriteLine("");
#endif
        }

        public void Cancel()
        {
            tokenSource.Cancel();
        }

        public void Dispose()
        {
            initialGameState = null;
            tokenSource.Dispose();
            tokenSource = null;
            taskSolver = null;
            Moves= null;
        }
    }

    public struct MoveTree
    {
        public HalfMove Move { get; private set; }
        public MoveTree[] ChildMoves { get; set; }
        public bool Check { get; internal set; }
        public bool CheckMate { get; internal set; }
        public bool StaleMate { get; internal set; }

        public MoveTree(HalfMove halfMove, decimal _)
        {
            Move = halfMove;
            ChildMoves = null;
            Check = false;
            CheckMate = false;
            StaleMate = false;
        }

        public override string ToString()
        {
            var tab = String.Join("\t", (new Array[(int)(Move.Dept * 2)]).ToList());
            var children = ChildMoves != null ? String.Join(".", ChildMoves.Select(f => f.ToString()).ToList()) : "";
            return "\r\n" + tab + Move.ToString() +
                (CheckMate ? "#" : Check ? "+" : StaleMate ? "=" : "")
                + children;
        }
    }
}
