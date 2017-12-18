using System;

namespace SP.Core
{
	public struct BoardSquare
	{
		private Square square;
		public bool Occupied { get { return Piece != null; } }

		public PieceBase Piece { get; private set; }

		internal void SetPiece(PieceBase piece)
		{
			Piece = piece;
		}

		public BoardSquare(Square s)
		{
			square = s;
			Piece = null;
		}

		public BoardSquare(Columns c, Rows r)
		{
			square = GetSquareIndex(c, r);
			Piece = null;
		}
		public static Square GetSquareIndex(Columns col, Rows row)
		{
			return (Square)((int)col + (int)row * 8);
		}

		public Columns Column => (Columns)((int)square % 8);
		public Rows Row => (Rows)Math.Floor((float)square / 8f);

		public static implicit operator BoardSquare(Square index)
		{
			return new BoardSquare(index);
		}
		public static implicit operator BoardSquare(int index)
		{
			return new BoardSquare((Square)index);
		}

		public static implicit operator int(BoardSquare square)
		{
			return (int)square.square;
		}
		public static implicit operator Square(BoardSquare square)
		{
			return square.square;
		}

	}
}