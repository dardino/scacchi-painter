using System;
using System.Collections;

namespace SP.Core
{
	public class EngineBitBoards
	{
		public UInt64 AllPieces => whitePieces | neutralPieces | blackPieces;

		private UInt64 whitePieces = 0x0;
		public UInt64 WhitePieces => whitePieces;

		private UInt64 blackPieces = 0x0;
		public UInt64 BlackPieces => blackPieces;

		private UInt64 neutralPieces = 0x0;
		private Board board;

		public EngineBitBoards(Board bb)
		{
			board = bb;

			for (var s = 0; s < 64; s++)
			{
				var p = board.GetPiece((Square)s);
				ulong x = (ulong)Math.Pow(2, s);
				if (p == null) continue;
				switch (p.Color)
				{
					case PieceColors.Black:
						blackPieces |= x;
						break;
					case PieceColors.Neutral:
						neutralPieces |= x;
						break;
					case PieceColors.White:
						whitePieces |= x;
						break;
				}
			}

		}

		public UInt64 NeutralPieces => neutralPieces;

		public static EngineBitBoards FromBoard(Board board) {
			var ebb = new EngineBitBoards(board);
			return ebb;
		}


	}
}