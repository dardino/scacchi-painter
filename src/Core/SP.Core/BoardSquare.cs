using System;

namespace SP.Core
{
	public struct BoardSquare: ICloneable
	{
		public PieceBase Piece { get; private set; }
		public readonly Columns Column;
		public readonly Rows Row;
		public readonly Square Square;
		public bool Occupied => Piece != null;
		internal bool SetPiece(PieceBase piece)
		{
			var occupied = Occupied;
			Piece = piece;
			return occupied;
		}
		public BoardSquare(Square s)
		{
			Square = s;
			Piece = null;
			Column = Square.GetColumn();
			Row = Square.GetRow();
		}

		public BoardSquare(Columns c, Rows r)
		{
			Square = GetSquareIndex(c, r);
			Piece = null;
			Column = Square.GetColumn();
			Row = Square.GetRow();
		}
		public static Square GetSquareIndex(Columns col, Rows row)
		{
			return (Square)((ushort)col + (ushort)row * 8);
		}

		public object Clone()
		{
			return new BoardSquare(Square)
			{
				Piece = Piece
			};
		}

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
			return (int)square.Square;
		}
		public static implicit operator Square(BoardSquare square)
		{
			return square.Square;
		}

		public override string ToString()
		{
			return $"{Square}({Piece})";
		}
	}
}