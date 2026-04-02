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
		[Priority(1)]
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
		[Priority(1)]
		public void GetSquareIndexTests() {
			var indexA1 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row1);
			var indexA2 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row2);
			var indexA3 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row3);
			var indexA4 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row4);
			var indexA5 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row5);
			var indexA6 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row6);
			var indexA7 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row7);
			var indexA8 = BoardSquare.GetSquareIndex(Columns.ColA, Rows.Row8);
			var indexH1 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row1);
			var indexH2 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row2);
			var indexH3 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row3);
			var indexH4 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row4);
			var indexH5 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row5);
			var indexH6 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row6);
			var indexH7 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row7);
			var indexH8 = BoardSquare.GetSquareIndex(Columns.ColH, Rows.Row8);

			Assert.AreEqual(indexA1, Square.A1);
			Assert.AreEqual(indexA2, Square.A2);
			Assert.AreEqual(indexA3, Square.A3);
			Assert.AreEqual(indexA4, Square.A4);
			Assert.AreEqual(indexA5, Square.A5);
			Assert.AreEqual(indexA6, Square.A6);
			Assert.AreEqual(indexA7, Square.A7);
			Assert.AreEqual(indexA8, Square.A8);
			Assert.AreEqual(indexH1, Square.H1);
			Assert.AreEqual(indexH2, Square.H2);
			Assert.AreEqual(indexH3, Square.H3);
			Assert.AreEqual(indexH4, Square.H4);
			Assert.AreEqual(indexH5, Square.H5);
			Assert.AreEqual(indexH6, Square.H6);
			Assert.AreEqual(indexH7, Square.H7);
			Assert.AreEqual(indexH8, Square.H8);
		}
		
	}
}
