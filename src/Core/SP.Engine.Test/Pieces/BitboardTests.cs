using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SP.Engine.Test.Pieces
{
	[TestClass]
	[TestCategory("Engine.BitBoard")]
	public class BitboardTests
	{
		[TestMethod]
		public void TestToSquareList()
		{
			var bb = BitBoardUtils.FromRowBytes(
				Row8: 0b10000000,
				Row7: 0b01000100,
				Row6: 0b00000000,
				Row5: 0b00010000,
				Row4: 0b00000000,
				Row3: 0b01000000,
				Row2: 0b00000000,
				Row1: 0b00100001
			);

			var expected = new List<Square>
			{
				Square.A8, Square.B3, Square.B7, Square.C1, Square.D5, Square.F7, Square.H1
			};

			var actual = BitBoardUtils.GetListOfSquares(bb).ToArray();

			Assert.AreEqual(expected.Count, actual.Count(), "TestToSquareList -> Length");
			for (int i = 0; i < expected.Count; i++)
			{
				Assert.IsTrue(actual.Contains(expected[i]), $"TestToSquareList -> {i}, {expected[i]}");
			}
			Assert.IsFalse(actual.Contains(Square.C3), $"TestToSquareList -> {Square.C3}");
			Assert.IsFalse(actual.Contains(Square.H8), $"TestToSquareList -> {Square.H8}");
			Assert.IsFalse(actual.Contains(Square.A1), $"TestToSquareList -> {Square.A1}");
		}
	}
}
