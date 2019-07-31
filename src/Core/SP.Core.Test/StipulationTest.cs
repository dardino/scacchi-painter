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
		public void TestStartingColor()
		{

			var st1 = new Stipulation(StipulationTypes.DirectMate, 2.5m);
			var st2 = new Stipulation(StipulationTypes.DirectMate, 5);
			var st3 = new Stipulation(StipulationTypes.HelpMate, 2.5m);
			var st4 = new Stipulation(StipulationTypes.HelpMate, 5);
			var st5 = new Stipulation(StipulationTypes.SelfStaleMate, 2.5m);
			var st6 = new Stipulation(StipulationTypes.SelfStaleMate, 5);
			var st7 = new Stipulation(StipulationTypes.HelpSelfStaleMate, 2.5m);
			var st8 = new Stipulation(StipulationTypes.HelpSelfStaleMate, 5);

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
