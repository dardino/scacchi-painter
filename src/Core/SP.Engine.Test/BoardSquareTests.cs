using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;

namespace SP.Engine.Test
{
	[TestClass]
	[TestCategory("Engine.BoardSquare")]
	public class BoardSqareTests
	{

		[TestMethod]
		public void ConversionTestsBits()
		{
			Assert.AreEqual(Square.H1.ToSquareBits(), (ulong)SquareBits.H1, "SquareBits.H1");
			Assert.AreEqual(Square.G1.ToSquareBits(), (ulong)SquareBits.G1, "SquareBits.G1");
			Assert.AreEqual(Square.F1.ToSquareBits(), (ulong)SquareBits.F1, "SquareBits.F1");
			Assert.AreEqual(Square.H2.ToSquareBits(), (ulong)SquareBits.H2, "SquareBits.H2");
			Assert.AreEqual(Square.H3.ToSquareBits(), (ulong)SquareBits.H3, "SquareBits.H3");
			Assert.AreEqual(Square.H4.ToSquareBits(), (ulong)SquareBits.H4, "SquareBits.H4");
			Assert.AreEqual(Square.A8.ToSquareBits(), (ulong)SquareBits.A8, "SquareBits.A8");
			Assert.AreEqual(Square.A7.ToSquareBits(), (ulong)SquareBits.A7, "SquareBits.A7");
			Assert.AreEqual(Square.A6.ToSquareBits(), (ulong)SquareBits.A6, "SquareBits.A6");
			Assert.AreEqual(Square.B8.ToSquareBits(), (ulong)SquareBits.B8, "SquareBits.B8");
			Assert.AreEqual(Square.B7.ToSquareBits(), (ulong)SquareBits.B7, "SquareBits.B7");
			Assert.AreEqual(Square.B6.ToSquareBits(), (ulong)SquareBits.B6, "SquareBits.B6");
		}
	}
}
