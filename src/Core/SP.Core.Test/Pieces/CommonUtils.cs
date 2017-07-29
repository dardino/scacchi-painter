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
			ulong Exp_c7 = 0x1020408000000000;
			ulong Exp_g1 = 0x102;
			ulong Exp_g3 = 0x1020408;

			ulong Act_a2 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.A2);
			ulong Act_c7 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.C7);
			ulong Act_g1 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.G1);
			ulong Act_h2 = Core.Pieces.CommonUtils.GetBotLeft2TopRightDiagonal(Square.H2);
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
		public void GetDiagonals()
		{

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

		[TestMethod]
		public void GetColumns()
		{
			ulong[] exps = new ulong[8];
			exps[(int)Columns.ColA] = 0x8080808080808080;
			exps[(int)Columns.ColB] = 0x4040404040404040;
			exps[(int)Columns.ColC] = 0x2020202020202020;
			exps[(int)Columns.ColD] = 0x1010101010101010;
			exps[(int)Columns.ColE] = 0x0808080808080808;
			exps[(int)Columns.ColF] = 0x0404040404040404;
			exps[(int)Columns.ColG] = 0x0202020202020202;
			exps[(int)Columns.ColH] = 0x0101010101010101;

			for (var col = 0; col < 8; col++)
			{
				var exp = exps[col];

				for (var r = 0; r < 8; r++)
				{
					ulong act = Core.Pieces.CommonUtils.GetColumns(BoardSquare.GetSquareIndex((Columns)col, (Rows)r));
					Assert.AreEqual(exp, act, Enum.GetName(typeof(Columns), col));
				}
			}
		}

		[TestMethod]
		public void GetRows()
		{
			ulong[] exps = new ulong[8];
			exps[(int)Rows.Row1] = 0x00000000000000FF;
			exps[(int)Rows.Row2] = 0x000000000000FF00;
			exps[(int)Rows.Row3] = 0x0000000000FF0000;
			exps[(int)Rows.Row4] = 0x00000000FF000000;
			exps[(int)Rows.Row5] = 0x000000FF00000000;
			exps[(int)Rows.Row6] = 0x0000FF0000000000;
			exps[(int)Rows.Row7] = 0x00FF000000000000;
			exps[(int)Rows.Row8] = 0xFF00000000000000;

			for (var r = 0; r < 8; r++)
			{
				var exp = exps[r];

				for (var col = 0; col < 8; col++)
				{
					ulong act = Core.Pieces.CommonUtils.GetRows(BoardSquare.GetSquareIndex((Columns)col, (Rows)r));
					Assert.AreEqual(exp, act, $"{Enum.GetName(typeof(Columns), col)}.{Enum.GetName(typeof(Rows), r)}");
				}
			}
		}
	}
}
