using System;
using System.Collections;

namespace SP.Core
{
	public class EngineBitBoards
	{
		private UInt64 allPieces;
		public UInt64 AllPieces => allPieces;

		private UInt64 whitePieces;
		public UInt64 WhitePieces => whitePieces;

		private UInt64 blackPieces;
		public UInt64 BlackPieces => blackPieces;

		private UInt64 neutralPieces;
		public UInt64 NeutralPieces => neutralPieces;

		public static EngineBitBoards FromBoard(Board board) {
			throw new NotImplementedException();
		}
	}
}