using System;

namespace SP.Core
{
	public struct BoardSquare: ICloneable
	{
		private Square square;
		public bool Occupied { get { return Piece != null; } }

		public PieceBase Piece { get; internal set; }

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

		public object Clone()
		{
			return new BoardSquare(square)
			{
				Piece = Piece
			};
		}

		public Columns Column => square.GetColumn();
		public Rows Row => square.GetRow();

		public Square Square => square;

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

		public override string ToString()
		{
			return $"{square}({Piece})";
		}
	}
}