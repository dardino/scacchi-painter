using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
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
		   var result = s.Start();

			// stop after 1.5 seconds
			var t = Task.Run(() => {
				Task.Delay(1_500).Wait();
				s.Stop();
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
	}
}
