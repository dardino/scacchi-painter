using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace SP.Engine.Test
{
	[TestClass]
	public class SolverTests
	{
		[TestMethod]
		public void TestCancellation()
		{
			var s = Solver.GetSolver(new GameState());
			Assert.AreEqual(TaskStatus.WaitingToRun, s.State);
		   var result = s.Solve();

			// stop after 1.5 seconds
			var t = Task.Run(() => {
				s.Cancel();
			});

			try
			{
				result.Wait();
			}
			catch (Exception)
			{
				throw;
			}

			// stopped
			Assert.AreEqual(TaskStatus.RanToCompletion, s.State);
		}


		[TestMethod]
		public void TestSolverOneDepth()
		{
			var gs = GameState.FromBoard(Board.FromNotation("8/8/8/8/8/8/P7/8"));
			gs.Board.Stipulation.Depth = 1;
			var s = Solver.GetSolver(gs);
			var t = s.Solve();
			var counter = t.Result.Count;
			var check = t.Result.Any((move) => gs.IsCheck(move));
			Assert.AreEqual(2, counter, $"Il numero di mosse calcolate deve essere 2 invece è {counter}");
			Assert.IsFalse(check, "Nessina mossa calcolata non deve essere check");
		}
	}
}
