using SP.Core;

namespace SP.Engine
{
	public enum CastlingIndexes {
		OO = 0,
		OOO = 1,
		oo = 2,
		ooo = 3
	}

	public class GameState
	{
		public BitBoard allied = 0;
		public BitBoard enemies = 0;
		public bool IsSquareUnderAttack(Square s) { return false; }
		public Move? LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
	}
}