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

	}
}
