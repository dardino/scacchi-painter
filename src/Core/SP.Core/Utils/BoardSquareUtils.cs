namespace SP.Core.Utils {
    public static class BoardSquareUtils {
		internal static void SetPiece(ref BoardSquare square, PieceBase piece)
		{
			square.Piece = piece;
		}

		internal static void SetPiece(Board board, Square square, PieceBase piece)
		{
			board.Cells[(uint)square].Piece = piece;
		}
    }
}