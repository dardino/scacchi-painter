using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using System;
using System.Collections.Generic;
using System.Diagnostics;
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
			var gs = GameState.FromBoard(Board.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"));
			var s = Solver.GetSolver(gs);
			Assert.AreEqual(TaskStatus.WaitingToRun, s.State);
		   var result = s.Solve();

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
			var check   = t.Result.Any((move) => gs.IsCheck(move.Move));
			Assert.AreEqual(2, counter, $"Il numero di mosse calcolate deve essere 2 invece è {counter}");
			Assert.IsFalse(check, "Nessuna mossa calcolata deve essere check");
		}

		[TestMethod]
		public void TestCheckMateWhite() {
			// test di alcune posizioni di scacco matto del bianco al re nero:
			var w_gs1_y = GameState.FromBoard(Board.FromNotation("k7/8/8/7K/8/8/1R6/R7", new Stipulation(StipulationType.DirectMate, 0.5m)));
			// test di alcune posizioni di NON scacco matto del bianco al re nero:
			var w_gs1_n = GameState.FromBoard(Board.FromNotation("K1k5/8/8/8/8/8/P7/8", new Stipulation(StipulationType.DirectMate, 0.5m)));
			// test di alcune posizioni di stallo del re nero:
			var w_gs2_n = GameState.FromBoard(Board.FromNotation("8/8/8/8/8/1K6/2Q5/k7", new Stipulation(StipulationType.DirectMate, 0.5m)));
			var m1 = w_gs1_y.Moves;
			Assert.IsTrue(w_gs1_y.IsCheckMate(), "k7/8/8/7K/8/8/1R6/R7 ha dato false ??");
			var m2 = w_gs1_n.Moves;
			Assert.IsFalse(w_gs1_n.IsCheckMate(), "K1k5/8/8/8/8/8/P7/8 ha dato true ??");
			var m3 = w_gs2_n.Moves;
			Assert.IsFalse(w_gs2_n.IsCheckMate(), "8/8/8/8/8/1K6/2Q5/k7 ha dato true ??");

		}


		[TestMethod]
		public void GetAllMoves() {
			var gs = GameState.FromBoard(Board.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"));
			gs.Board.Stipulation.Depth = 1;
			var s = Solver.GetSolver(gs);
			var t = s.Solve();
			var tuttelemosse = t.Result.ToList();
			var counter = tuttelemosse.Count;
			Assert.AreEqual(counter, 16, $"Il numero di mosse calcolate deve essere 16 invece è {counter}");
		}

		[TestMethod]
		public void GetChecks()
		{
			var gs = GameState.FromBoard(Board.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"));
			gs.Board.Stipulation.Depth = 1;
			var t = gs.Moves;
			var check = t.Count((move) => gs.IsCheck(move));
			Assert.AreEqual(check, 3, $"3 mosse devono essere di check, invece sono {check}");
		}

		[TestMethod]
		public void FindCheckMate()
		{
			var gs = GameState.FromBoard(Board.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"));
			var sw = new Stopwatch();
			sw.Start();
			gs.Board.Stipulation.Depth = 2m;
			var s = Solver.GetSolver(gs);
			var t = s.Solve();
			var tuttelemosse = t.Result.ToList();
			var counter = tuttelemosse.Count;
			sw.Stop();
			Debug.WriteLine(sw.Elapsed);
			Assert.AreEqual(counter, 16, $"Il numero di mosse calcolate deve essere 16 invece è {counter}");
		}
	}
}
