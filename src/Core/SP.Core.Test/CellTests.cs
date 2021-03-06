﻿using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	[TestCategory("Core.Cell")]
	public class CellTest
	{
		[TestMethod]
		[Priority(1)]
		public void TestOccupation()
		{
			var cell0 = new BoardSquare(0);
			Assert.IsFalse(cell0.Occupied);
			cell0.SetPiece(new Core.Pieces.Pawn());
			Assert.IsTrue(cell0.Occupied);
		}

		[TestMethod]
		[Priority(1)]
		public void TestRows()
		{
			var cell0 = new BoardSquare(0);
			Assert.AreEqual(cell0.Row, Rows.Row1);
			var cell22 = new BoardSquare((Square)22);
			Assert.AreEqual(cell22.Row, Rows.Row3);
			var cell63 = new BoardSquare((Square)63);
			Assert.AreEqual(cell63.Row, Rows.Row8);
		}

		[TestMethod]
		[Priority(1)]
		public void TestColumns()
		{
			var cell0 = new BoardSquare(0);
			Assert.AreEqual(cell0.Column, Columns.ColH);
			var cell16 = new BoardSquare((Square)16);
			Assert.AreEqual(cell16.Column, Columns.ColH);
			var cell22 = new BoardSquare((Square)22);
			Assert.AreEqual(cell22.Column, Columns.ColB);
			var cell55 = new BoardSquare((Square)55);
			Assert.AreEqual(cell55.Column, Columns.ColA);
			var cell63 = new BoardSquare((Square)63);
			Assert.AreEqual(cell63.Column, Columns.ColA);
		}
	}

}
