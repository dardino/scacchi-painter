using Microsoft.VisualStudio.TestTools.UnitTesting;
using System;
using System.Collections.Generic;
using System.Text;

namespace SP.Core.Test.Pieces
{
	[TestClass]
	[TestCategory("Core.Piece.CommonTools")]
	public class CommonUtils
	{
		[TestMethod]
		public void DiagonalA1H8CalcTest()
		{
			ulong Exp_a2 = 0x204081020408000;
			ulong Act_a2 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.A2);

			ulong Exp_c7 = 0x1020408000000000;
			ulong Act_c7 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.C7);

			ulong Exp_g1 = 0x102;
			ulong Act_g1 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.G1);
			ulong Act_h2 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.H2);

			ulong Exp_g3 = 0x1020408;
			ulong Act_g3 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.G3);

			Assert.AreEqual(Exp_a2, Act_a2, "a2");
			Assert.AreEqual(Exp_c7, Act_c7, "c7");
			Assert.AreEqual(Exp_g1, Act_g1, "g1");
			Assert.AreEqual(Exp_g3, Act_g3, "g3");
			Assert.AreEqual(Exp_g1, Act_h2, "h2");


		}

		[TestMethod]
		public void DiagonalA8H1CalcTest()
		{
			ulong Exp_a2 = 0x8040;
			ulong Act_a2 = Core.Pieces.CommonUtils.GetTopLeft2BottomRight(Square.A2);

			ulong Exp_c7 = 0x4020100804020100;
			ulong Act_c7 = Core.Pieces.CommonUtils.GetTopLeft2BottomRight(Square.C7);

			ulong Exp_g1 = 0x80402010080402;
			ulong Act_g1 = Core.Pieces.CommonUtils.GetTopLeft2BottomRight(Square.G1);

			ulong Exp_h1 = 0x8040201008040201;
			ulong Act_h1 = Core.Pieces.CommonUtils.GetTopLeft2BottomRight(Square.H1);

			ulong Exp_g5 = 0x1008040201000000;
			ulong Act_g5 = Core.Pieces.CommonUtils.GetTopLeft2BottomRight(Square.G5);

			ulong Exp_g3 = 0x4020100804020100;
			ulong Act_g3 = Core.Pieces.CommonUtils.GetTopLeft2BottomRight(Square.G3);

			Assert.AreEqual(Exp_a2, Act_a2, "a2");
			Assert.AreEqual(Exp_c7, Act_c7, "c7");
			Assert.AreEqual(Exp_g1, Act_g1, "g1");
			Assert.AreEqual(Exp_h1, Act_h1, "h1");
			Assert.AreEqual(Exp_g5, Act_g5, "g5");
			Assert.AreEqual(Exp_g3, Act_g3, "g3");
		}

		[TestMethod]
		public void GetDiagonals() {

			ulong g3 = 0x4020100805020508;
			ulong e5 = 0x4122140814224180;
			ulong a5 = 0x1020408040201008;
			ulong a1 = Core.Pieces.CommonUtils.DiagonalA1H8;
			ulong h8 = Core.Pieces.CommonUtils.DiagonalA1H8;
			ulong a8 = Core.Pieces.CommonUtils.DiagonalA8H1;
			ulong h1 = Core.Pieces.CommonUtils.DiagonalA8H1;
			ulong e2 = 0x0000804122140814;
			ulong f3 = 0x804020110a040a11;
			ulong c8 = 0x2050880402010000;

			ulong Act_g3 = Core.Pieces.CommonUtils.GetDiagonals(Square.G3);
			ulong Act_e5 = Core.Pieces.CommonUtils.GetDiagonals(Square.E5);
			ulong Act_a5 = Core.Pieces.CommonUtils.GetDiagonals(Square.A5);
			ulong Act_a1 = Core.Pieces.CommonUtils.GetDiagonals(Square.A1);
			ulong Act_h8 = Core.Pieces.CommonUtils.GetDiagonals(Square.H8);
			ulong Act_a8 = Core.Pieces.CommonUtils.GetDiagonals(Square.A8);
			ulong Act_h1 = Core.Pieces.CommonUtils.GetDiagonals(Square.H1);
			ulong Act_e2 = Core.Pieces.CommonUtils.GetDiagonals(Square.E2);
			ulong Act_f3 = Core.Pieces.CommonUtils.GetDiagonals(Square.F3);
			ulong Act_c8 = Core.Pieces.CommonUtils.GetDiagonals(Square.C8);

			Assert.AreEqual(g3, Act_g3, "g3");
			Assert.AreEqual(e5, Act_e5, "e5");
			Assert.AreEqual(a5, Act_a5, "a5");
			Assert.AreEqual(a1, Act_a1, "a1");
			Assert.AreEqual(h8, Act_h8, "h8");
			Assert.AreEqual(a8, Act_a8, "a8");
			Assert.AreEqual(h1, Act_h1, "h1");
			Assert.AreEqual(e2, Act_e2, "e2");
			Assert.AreEqual(f3, Act_f3, "f3");
			Assert.AreEqual(c8, Act_c8, "c8");
		}
	}
}
