using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	[TestCategory("Core.Piece")]
	public class PieceTests
	{
		[TestMethod]
		public void TestPieceTypesCount()
		{
			var p = new Pieces.Bishop();
			var types = PieceBase.piecetypes.ToArray();
			var count = types.Length;
			Assert.AreEqual(6, count);
		}

		[TestMethod]
		public void TestPieceTypes()
		{
			var p = PieceBase.FromFEN("K+ ");
			Assert.AreEqual(p.GetType(), typeof(Pieces.King));
			p = PieceBase.FromFEN("Q+ ");
			Assert.AreEqual(p.GetType(), typeof(Pieces.Queen));
			p = PieceBase.FromFEN("R+ ");
			Assert.AreEqual(p.GetType(), typeof(Pieces.Rock));
			p = PieceBase.FromFEN("B+ ");
			Assert.AreEqual(p.GetType(), typeof(Pieces.Bishop));
			p = PieceBase.FromFEN("N+ ");
			Assert.AreEqual(p.GetType(), typeof(Pieces.Horse));
			p = PieceBase.FromFEN("P+ ");
			Assert.AreEqual(p.GetType(), typeof(Pieces.Pawn));
		}
	}
}
