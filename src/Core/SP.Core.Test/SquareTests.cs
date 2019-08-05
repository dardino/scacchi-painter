using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core.Utils;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test
{
	[TestClass]
	[TestCategory("Core.Square")]
	public class SquareTest
	{
		[TestMethod]
		[Priority(1)]
		public void TestGetColumn()
		{
			var sq1 = Square.A1.GetColumn();
			var sq2 = Square.B2.GetColumn();
			var sq3 = Square.C3.GetColumn();
			var sq4 = Square.D4.GetColumn();
			var sq5 = Square.E5.GetColumn();
			var sq6 = Square.F6.GetColumn();
			var sq7 = Square.G7.GetColumn();
			var sq8 = Square.H8.GetColumn();
			Assert.AreEqual(Columns.ColA, sq1);
			Assert.AreEqual(Columns.ColB, sq2);
			Assert.AreEqual(Columns.ColC, sq3);
			Assert.AreEqual(Columns.ColD, sq4);
			Assert.AreEqual(Columns.ColE, sq5);
			Assert.AreEqual(Columns.ColF, sq6);
			Assert.AreEqual(Columns.ColG, sq7);
			Assert.AreEqual(Columns.ColH, sq8);
		}
		[TestMethod]
		[Priority(1)]
		public void TestGetRow()
		{
			var sq1 = Square.A1.GetRow();
			var sq2 = Square.B2.GetRow();
			var sq3 = Square.C3.GetRow();
			var sq4 = Square.D4.GetRow();
			var sq5 = Square.E5.GetRow();
			var sq6 = Square.F6.GetRow();
			var sq7 = Square.G7.GetRow();
			var sq8 = Square.H8.GetRow();
			Assert.AreEqual(Rows.Row1, sq1);
			Assert.AreEqual(Rows.Row2, sq2);
			Assert.AreEqual(Rows.Row3, sq3);
			Assert.AreEqual(Rows.Row4, sq4);
			Assert.AreEqual(Rows.Row5, sq5);
			Assert.AreEqual(Rows.Row6, sq6);
			Assert.AreEqual(Rows.Row7, sq7);
			Assert.AreEqual(Rows.Row8, sq8);
		}
	}

}
