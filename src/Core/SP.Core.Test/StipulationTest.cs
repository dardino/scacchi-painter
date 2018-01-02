using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	[TestCategory("Core.Stipulation")]
	public class StipulationTest
	{

		[TestMethod]
		public void TestStartingColor() {

			var st1 = new Stipulation(2.5m) { StipulationType = StipulationType.DirectMate };
			var st2 = new Stipulation(5) { StipulationType = StipulationType.DirectMate };
			var st3 = new Stipulation(2.5m) { StipulationType = StipulationType.HelpMate };
			var st4 = new Stipulation(5) { StipulationType = StipulationType.HelpMate };
			var st5 = new Stipulation(2.5m) { StipulationType = StipulationType.SelfStaleMate };
			var st6 = new Stipulation(5) { StipulationType = StipulationType.SelfStaleMate };
			var st7 = new Stipulation(2.5m) { StipulationType = StipulationType.HelpSelfStaleMate };
			var st8 = new Stipulation(5) { StipulationType = StipulationType.HelpSelfStaleMate };

			Assert.AreEqual(PieceColors.Black, st1.StartingMoveColor, "Diretto in 2.5 --> tocca al nero");
			Assert.AreEqual(PieceColors.White, st2.StartingMoveColor, "Diretto in 5 --> tocca al bianco");
			Assert.AreEqual(PieceColors.White, st3.StartingMoveColor, "Aiutomatto in 2.5 --> tocca al bianco");
			Assert.AreEqual(PieceColors.Black, st4.StartingMoveColor, "Aiutomatto in 5 --> tocca al nero");
			Assert.AreEqual(PieceColors.Black, st5.StartingMoveColor, "Autostallo in 2.5 --> tocca al nero");
			Assert.AreEqual(PieceColors.White, st6.StartingMoveColor, "Autostallo in 5 --> tocca al bianco");
			Assert.AreEqual(PieceColors.White, st7.StartingMoveColor, "Aiutoautostallo in 2.5 --> tocca al bianco");
			Assert.AreEqual(PieceColors.Black, st8.StartingMoveColor, "Aiutoautostallo in 5 --> tocca al nero");

		}
	}
}
