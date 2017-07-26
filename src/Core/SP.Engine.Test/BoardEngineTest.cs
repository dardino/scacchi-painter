using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;

namespace SP.Engine.Test
{
	[TestClass]
	[TestCategory("Engine.Board")]
	public class BoardEngineTest
	{
		[TestMethod]
		public void BitBoardGenerator()
		{
			// ---------------------------------
			// |   |   |   | Q | N |   |   |   |
			// ---------------------------------
			// |   |   | p |   | r | r |   |   |
			// ---------------------------------
			// | b |   |   | n | k | p |   |   |
			// ---------------------------------
			// |   | p |   |   |   | n |   |   |
			// ---------------------------------
			// |   |   |   | P |   |   |   |   |
			// ---------------------------------
			// |   | p |   |   | p |   | b |   |
			// ---------------------------------
			// | p | P |   |   | p |   | q |   |
			// ---------------------------------
			// |   |   | K |   |   |   |   |   |
			// ---------------------------------
			var notation  = "3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5";
			ulong bitAllPieces = 0x182c9c44104aca20;
			ulong bitBlacks = 0x2c9c44004a8a00;
			ulong bitWhites = 0x1800000010004020;

			var board     = Board.FromNotation(notation);
			var bitBoards = EngineBitBoards.FromBoard(board);

			Assert.AreEqual(bitAllPieces, bitBoards.AllPieces);
			Assert.AreEqual(bitBlacks, bitBoards.BlackPieces);
			Assert.AreEqual(bitWhites, bitBoards.WhitePieces);

		}

	}
}
