using Microsoft.VisualStudio.TestTools.UnitTesting;
using SP.Core;

namespace SP.Engine.Test
{
	[TestClass]
	public class BoardEngineTest
	{
		[TestMethod]
		public void BitBoardGenerator()
		{
			var notation  = "3QN3/2p1rr2/b2nkp2/1p3n2/3P4/1p2p1b1/pP2p1q1/2K5";
			var board     = Board.FromNotation(notation);
			var bitBoards = EngineBitBoards.FromBoard(board);



		}

	}
}
