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
	public class Solver
	{
		private GameState initialGameState = null;
		private CancellationTokenSource tokenSource;
		private Task<MoveList> taskSolver;
		private Lazy<MoveList> Moves { get; set; } = new Lazy<MoveList>(true);

		public TaskStatus State => taskSolver?.Status ?? TaskStatus.WaitingToRun;

		public static Solver GetSolver(GameState startGame)
		{
			return new Solver() { initialGameState = startGame };
		}

		private Solver() { }

		public Task<MoveList> Solve()
		{
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
			else
			{
				Log("You cannot call Start method more than once! Call Stop() then call Start() again", true);
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
				if (tokenSource.IsCancellationRequested) {
					return Moves.Value;
				}
				var movefound = FindMoves(initialGameState);
				if (movefound == null)
					return Moves.Value;

				foreach (var move in movefound)
				{

					// if (tokenSource.IsCancellationRequested) { cloop.Break(); return; }
					Moves.Value.Add(move);
					Log(move.ToString(), true);

				};

				return Moves.Value;
			}, tokenSource.Token);
#if DEBUG
			System.Diagnostics.Debug.WriteLine($"elapsed time: {stopwatch.Elapsed}");
#endif
			return taskSolver;
		}

		private MoveList FindMoves(GameState gs)
		{
			if (gs.MaxDepth < gs.ActualDepth) return null;
			var gsml = gs.Moves();
			if (!gsml.Any()) return null;
			MoveList ml = new MoveList();
			Parallel.ForEach(gsml, (m) =>
			{
				var subg = gs.GetAfterMove(m);
				var mTree = new MoveTree(m, subg.ActualDepth);
				ml.Add(mTree);
				var mosse = FindMoves(subg);
				if (mosse != null && mosse.Count > 0)
				{
					mosse.ToList().ForEach(mTree.ChildMoves.Add);
				}
				else
				{
					mTree.Check = subg.IsCheck();
					mTree.CheckMate = subg.IsCheckMate();
				}
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
	}

	public class MoveList : ConcurrentBag<MoveTree>
	{

	}

	public class MoveTree
	{
		public HalfMove Move { get; private set; }
		public MoveList ChildMoves { get; } = new MoveList();
		public decimal Dept { get; private set; }

		public MoveTree(HalfMove halfMove, decimal dept)
		{
			Move = halfMove;
			Dept = dept;
		}
		public bool Check { get; internal set; }
		public bool CheckMate { get; internal set; }

		public override string ToString()
		{
			var tab = String.Join("_", (new Array[(int)(Dept * 2)]).ToList());
			var children = ChildMoves != null ? String.Join(".", ChildMoves.Select(f => f.ToString()).ToList()) : "";
			return "\r\n" + tab + Move.ToString() + 
				(CheckMate ? "#": Check ? "+": "")
				+ children;
		}
	}
}
