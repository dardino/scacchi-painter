using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using SP.Core.Utils;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;

namespace SP.Engine.Test
{
	[TestClass]
	[TestCategory("Engine.PerformanceTests")]
	public class PerformanceTests
	{ 
        [TestMethod]
        public void GameStateCloneOf() {
            var gs = GameStateStatic.FromBoard(BoardUtils.FromNotation("3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5"));

            var sp = Stopwatch.StartNew();
            var counter = 0;
            while(sp.ElapsedMilliseconds<100) {
                var gsnew = GameStateStatic.GetCloneOf(gs);
                counter++;
            }
            sp.Stop();
            var average  =(decimal)sp.ElapsedMilliseconds / (decimal)counter;
            Console.WriteLine("millisecondi per clone: {0}",average);
            Assert.IsTrue(average < 0.001m);
        }
    }
}