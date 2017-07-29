using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	[TestCategory("Core.Board")]
	public class BoardSqareTests
	{
		[TestMethod]
		public void ConversionTests()
		{
			BoardSquare p = new BoardSquare();
			Assert.AreEqual(p.Column, Columns.ColH);
			Assert.AreEqual(p.Row, Rows.Row1);
			BoardSquare p1 = new BoardSquare(Columns.ColA, Rows.Row6);
			Assert.AreEqual(Square.A6, (Square)p1);
			Assert.AreEqual(p1.Column, Columns.ColA);
			Assert.AreEqual(p1.Row, Rows.Row6);
		}

		[TestMethod]
		public void ConversionTestsBits()
		{
			Assert.AreEqual(Square.H1.ToSquareBits(), SquareBits.H1, "SquareBits.H1");
			Assert.AreEqual(Square.G1.ToSquareBits(), SquareBits.G1, "SquareBits.G1");
			Assert.AreEqual(Square.F1.ToSquareBits(), SquareBits.F1, "SquareBits.F1");
			Assert.AreEqual(Square.H2.ToSquareBits(), SquareBits.H2, "SquareBits.H2");
			Assert.AreEqual(Square.H3.ToSquareBits(), SquareBits.H3, "SquareBits.H3");
			Assert.AreEqual(Square.H4.ToSquareBits(), SquareBits.H4, "SquareBits.H4");
			Assert.AreEqual(Square.A8.ToSquareBits(), SquareBits.A8, "SquareBits.A8");
			Assert.AreEqual(Square.A7.ToSquareBits(), SquareBits.A7, "SquareBits.A7");
			Assert.AreEqual(Square.A6.ToSquareBits(), SquareBits.A6, "SquareBits.A6");
			Assert.AreEqual(Square.B8.ToSquareBits(), SquareBits.B8, "SquareBits.B8");
			Assert.AreEqual(Square.B7.ToSquareBits(), SquareBits.B7, "SquareBits.B7");
			Assert.AreEqual(Square.B6.ToSquareBits(), SquareBits.B6, "SquareBits.B6");
		}
	}
}
