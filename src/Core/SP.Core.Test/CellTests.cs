using Microsoft.VisualStudio.TestTools.UnitTesting;
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
		public void TestOccupation()
		{
			var cell0 = new Cell(0);
			Assert.IsFalse(cell0.Occupied);
			cell0.SetPiece(new Pieces.Pawn());
			Assert.IsTrue(cell0.Occupied);
		}

		[TestMethod]
		public void TestRows()
		{
			var cell0 = new Cell(0);
			Assert.AreEqual(cell0.Row, Rows.Row8);
			var cell22 = new Cell(22);
			Assert.AreEqual(cell22.Row, Rows.Row6);
			var cell63 = new Cell(63);
			Assert.AreEqual(cell63.Row, Rows.Row1);
		}

		[TestMethod]
		public void TestColumns()
		{
			var cell0 = new Cell(0);
			Assert.AreEqual(cell0.Column, Columns.ColA);
			var cell16 = new Cell(16);
			Assert.AreEqual(cell16.Column, Columns.ColA);
			var cell22 = new Cell(22);
			Assert.AreEqual(cell22.Column, Columns.ColG);
			var cell55 = new Cell(55);
			Assert.AreEqual(cell55.Column, Columns.ColH);
			var cell63 = new Cell(63);
			Assert.AreEqual(cell63.Column, Columns.ColH);
		}
	}

}
