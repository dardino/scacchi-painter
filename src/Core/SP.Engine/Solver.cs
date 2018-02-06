using System;
using System.Collections.Generic;
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
		private GameState game;

		private CancellationTokenSource tokenSource;
		private Task<MoveTree> taskSolver;

		public TaskStatus State => taskSolver?.Status ?? TaskStatus.WaitingToRun;

		public static Solver GetSolver(GameState startGame)
		{
			return new Solver() { game = startGame };
		}

		private Solver() { }

		public Task<MoveTree> Start() {
			if (State != TaskStatus.Running)
			{
				if (tokenSource != null) tokenSource.Dispose();
				if (taskSolver != null) taskSolver.Dispose();

				tokenSource = new CancellationTokenSource();
				System.Diagnostics.Debug.WriteLine($"solver creation");
				taskSolver = Task.Factory.StartNew(() =>
				{
					var tree = new MoveTree();
					for (var i = 0; i < 10; i++)
					{
						if (tokenSource.IsCancellationRequested)
						{
							break;
						}
						System.Diagnostics.Debug.WriteLine($"iteration count: {i}");
						Task.Delay(1_000).Wait();
					}
					return tree;
				}, tokenSource.Token);
				
				return taskSolver;
			}
			else {
				Log("You cannot call Start method more than once! Call Stop() then call Start() again");
				return null;
			}
		}

		private void Log(string v)
		{
			Console.WriteLine(v);
#if DEBUG
			System.Diagnostics.Debug.WriteLine(v);
#endif
		}

		public void Stop()
		{
			tokenSource.Cancel();
		}
	}

	public class MoveTree
	{
		public IEnumerable<Move> Moves { get; set; }
	}
}
