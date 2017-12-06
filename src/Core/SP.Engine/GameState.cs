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
		public BitBoard Allied = 0;
		public BitBoard Enemies = 0;
		public BitBoard UnderAttackCells = 0;

		public bool IsSquareUnderAttack(Square s) { return false; }
		public Move? LastMove = null;
		public bool[] CastlingAllowed = new bool[4] { true, true, true, true };
		public ulong AlliedRocks = 0; // bitboard for castling check
		public PieceColors MoveTo = PieceColors.White;
	}
}