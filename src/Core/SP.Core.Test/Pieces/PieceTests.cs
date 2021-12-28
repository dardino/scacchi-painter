using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;
using SP.Core.Utils;

namespace SP.Core.Test.Pieces
{
	[TestClass]
	[TestCategory("Core.Piece")]
	public class PieceTests
	{
		[TestMethod]
		[Priority(1)]
		public void TestPieceTypesCount()
		{
			// var p = new Core.Pieces.Bishop();
			var types = PieceBaseUtils.piecetypes.ToArray();
			var count = types.Length;
			Assert.AreEqual(6, count);
		}

		[TestMethod]
		[Priority(1)]
		public void TestPieceTypes()
		{
			var p = PieceBaseUtils.FromFEN("K+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.King));
			p = PieceBaseUtils.FromFEN("Q+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Queen));
			p = PieceBaseUtils.FromFEN("R+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Rock));
			p = PieceBaseUtils.FromFEN("B+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Bishop));
			p = PieceBaseUtils.FromFEN("N+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Horse));
			p = PieceBaseUtils.FromFEN("P+ ");
			Assert.AreEqual(p.GetType(), typeof(Core.Pieces.Pawn));
		}
	}
}
