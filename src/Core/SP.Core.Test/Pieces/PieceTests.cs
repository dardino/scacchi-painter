using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test.Pieces
{
	[TestClass]
	[TestCategory("Core.Piece")]
	public class PieceTests
	{
		[TestMethod]
		public void TestPieceTypesCount()
		{
			var p = new Core.Pieces.Bishop();
			var types = PieceBase.piecetypes.ToArray();
			var count = types.Length;
			Assert.AreEqual(6, count);
		}

		[TestMethod]
		public void TestPieceTypes()
		{
			var p = PieceBase.FromFEN("K+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.King));
			p = PieceBase.FromFEN("Q+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Queen));
			p = PieceBase.FromFEN("R+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Rock));
			p = PieceBase.FromFEN("B+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Bishop));
			p = PieceBase.FromFEN("N+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Horse));
			p = PieceBase.FromFEN("P+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Pawn));
		}
	}
}
