﻿using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Core.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace SP.Engine.Test
{
    [TestClass]
    public class SolverTests
    {
        [TestMethod]
		[Priority(1)]
        public void TestCancellation()
        {
            var tokenSource = new CancellationTokenSource();
            var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"), tokenSource.Token);
            var s = Solver.GetSolver(gs, tokenSource);
            Assert.AreEqual(TaskStatus.WaitingToRun, s.State);
            var result = s.Solve();

            var t = Task.Run(() =>
            {
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
		[Priority(1)]
        public void TestSolverOneDepth()
        {
            var tokenSource = new CancellationTokenSource();
            var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("8/8/8/8/8/8/P7/8"), tokenSource.Token);
            gs.Board.Stipulation.Depth = 1;
            var s = Solver.GetSolver(gs, tokenSource);
            var t = s.Solve();
            t.Wait();
            var counter = t.Result.Count;
            var check = t.Result.Any((move) => GameStateStatic.IsCheckAfter(ref gs, move.Move, tokenSource.Token));
            Assert.AreEqual(2, counter, $"Il numero di mosse calcolate deve essere 2 invece è {counter}");
            Assert.IsFalse(check, "Nessuna mossa calcolata deve essere check");
        }

        [TestMethod]
		[Priority(1)]
        public void TestCheckMateWhite()
        {
            var tokenSource = new CancellationTokenSource();
            // test di alcune posizioni di scacco matto del bianco al re nero:
            var w_gs1_y = GameStateStatic.FromBoard(BoardUtils.FromNotation("k7/8/8/7K/8/8/1R6/R7", new Stipulation(StipulationTypes.DirectMate, 0.5m)), tokenSource.Token);
            // test di alcune posizioni di NON scacco matto del bianco al re nero:
            var w_gs1_n = GameStateStatic.FromBoard(BoardUtils.FromNotation("K1k5/8/8/8/8/8/P7/8", new Stipulation(StipulationTypes.DirectMate, 0.5m)), tokenSource.Token);
            // test di alcune posizioni di stallo del re nero:
            var w_gs2_n = GameStateStatic.FromBoard(BoardUtils.FromNotation("8/8/8/8/8/1K6/2Q5/k7", new Stipulation(StipulationTypes.DirectMate, 0.5m)), tokenSource.Token);
            GameStateStatic.Analyze(ref w_gs1_y);
            Assert.IsTrue(GameStateStatic.IsCheckMate(ref w_gs1_y), "k7/8/8/7K/8/8/1R6/R7 ha dato false ??");
            GameStateStatic.Analyze(ref w_gs1_n);
            Assert.IsFalse(GameStateStatic.IsCheckMate(ref w_gs1_n), "K1k5/8/8/8/8/8/P7/8 ha dato true ??");
            GameStateStatic.Analyze(ref w_gs2_n);
            Assert.IsFalse(GameStateStatic.IsCheckMate(ref w_gs2_n), "8/8/8/8/8/1K6/2Q5/k7 ha dato true ??");
        }


        [TestMethod]
		[Priority(1)]
        public void GetAllMoves()
        {
            var tokenSource = new CancellationTokenSource();
            var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"), tokenSource.Token);
            gs.Board.Stipulation.Depth = 1;
            var s = Solver.GetSolver(gs, tokenSource);
            var t = s.Solve();
            var tuttelemosse = t.Result.ToList();
            var counter = tuttelemosse.Count;
            Assert.AreEqual(16, counter, $"Il numero di mosse calcolate deve essere 16 invece è {counter}");
        }

        [TestMethod]
		[Priority(1)]
        public void GetChecks()
        {
            var tokenSource = new CancellationTokenSource();
            var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"), tokenSource.Token);
            gs.Board.Stipulation.Depth = 1;
            GameStateStatic.Analyze(ref gs);
            var t = gs.Moves;
            var check = t.Count((move) => GameStateStatic.IsCheckAfter(ref gs, move, tokenSource.Token));
            Assert.AreEqual(3, check, $"3 mosse devono essere di check, invece sono {check}");
        }

        [TestMethod]
		[Priority(1)]
        public void FindCheckMate()
        {
            var tokenSource = new CancellationTokenSource();
            var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("7q/p2r4/4k3/R4p2/B1p4p/8/1n6/4K3"), tokenSource.Token);
            var sw = new Stopwatch();
            sw.Start();
            gs.Board.Stipulation.Depth = 2m;
            var s = Solver.GetSolver(gs, tokenSource);
            Console.WriteLine($"GetSolver: {sw.Elapsed}");
            var t = s.Solve();
            Console.WriteLine($"Solve: {sw.Elapsed}");
            var tuttelemosse = t.Result.ToArray();
            Console.WriteLine($"ToList: {sw.Elapsed}");
            sw.Stop();
            var counter = tuttelemosse.Length;
            Console.WriteLine($"Tempo impiegato per calcolare tutte le mosse e materializzarle: {sw.Elapsed}");
            Assert.AreEqual(counter, 16, $"Il numero di mosse calcolate deve essere 16 invece è {counter}");
		}
	}
}
