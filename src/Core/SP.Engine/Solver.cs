using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SP.Engine
{
	/// <summary>
	/// Classe per risolvere i problemi di scacchi
	/// </summary>
	public class Solver
	{
		private GameState initialGameState = null;
		private CancellationTokenSource tokenSource;
		private Task<MoveList> taskSolver;
		private int currentDepth = 0;
		private Lazy<MoveList> moves { get; set; } = new Lazy<MoveList>(true);

		public TaskStatus State => taskSolver?.Status ?? TaskStatus.WaitingToRun;

		public static Solver GetSolver(GameState startGame)
		{
			return new Solver() { initialGameState = startGame };
		}

		private Solver() { }

		public Task<MoveList> Solve() {
			if (initialGameState.Board == null) return null;
			if (State != TaskStatus.Running)
			{
				if (tokenSource != null)
				{
					tokenSource.Cancel();
					tokenSource.Dispose();
				}
				if (taskSolver != null)
				{
					taskSolver.Dispose();
				}
				tokenSource = new CancellationTokenSource();
				initialGameState.SetCancellationToken(tokenSource.Token);
				return InternalSolve();
			}
			else {
				Log("You cannot call Start method more than once! Call Stop() then call Start() again");
				return null;
			}
		}

		private Task<MoveList> InternalSolve()
		{
			var stopwatch = System.Diagnostics.Stopwatch.StartNew();
#if DEBUG
			System.Diagnostics.Debug.WriteLine($"solver creation");
#endif
			taskSolver = Task.Factory.StartNew(() =>
			{
				if (tokenSource.IsCancellationRequested) { return moves.Value; }
				var movefound = FindMoves(initialGameState, 0);
				if (movefound == null)
					return moves.Value;

				Parallel.ForEach(movefound, (move, cloop) => {
					if (tokenSource.IsCancellationRequested) { cloop.Break(); return; }
					moves.Value.Add(move);
				});

				return moves.Value;
			}, tokenSource.Token);
#if DEBUG
			System.Diagnostics.Debug.WriteLine($"elapsed time: {stopwatch.Elapsed}");
#endif
			return taskSolver;
		}

		private MoveList FindMoves(GameState gs, int deep)
		{
			if (gs.MaxDepth < deep) return null;
			var gsml = gs.Moves;
			if (!gsml.Any()) return null;
			MoveList ml = new MoveList();
			foreach (var m in gsml) {
				ml.Add(m);
			}
			return ml;
		}

		private void Log(string v)
		{
			Console.WriteLine(v);
#if DEBUG
			System.Diagnostics.Debug.WriteLine(v);
#endif
		}

		public void Cancel()
		{
			tokenSource.Cancel();
		}
	}

	public class MoveList : ConcurrentBag<Move>
	{
		public Lazy<MoveList> ChildMoves { get; set; } = new Lazy<MoveList>(true);
	}
}
