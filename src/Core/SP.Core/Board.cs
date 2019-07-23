using System;
using System.Collections.Generic;
using System.Linq;
using SP.Core.Utils;

namespace SP.Core
{
    public class Board : IDisposable
    {
        private BoardSquare[] cells = new BoardSquare[64];
        public BoardSquare[] Cells => cells;
        public int WhiteCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.White ? 1 : 0);
        public int BlackCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.Black ? 1 : 0);
        public int NeutralCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.Neutral ? 1 : 0);
        public int TotalCount => cells.Sum(c => c.Occupied ? 1 : 0);

        public Stipulation Stipulation { get; set; } = new Stipulation(2);

        public PieceBase GetPiece(Square sq)
        {
            return Cells[(uint)sq].Piece;
        }
        public PieceBase GetPiece(Columns col, Rows row)
        {
            return GetPiece(BoardSquare.GetSquareIndex(col, row));
        }

        public Board()
        {
            for (int i = 0; i < 64; i++) cells[i] = new BoardSquare((Square)i);
        }

        public Board Clone()
        {
            var b = new Board
            {
                Stipulation = Stipulation
            };
            cells.CopyTo(b.cells, 0);
            return b;
        }

        public void Dispose()
        {
            cells = null;
            Stipulation = null;
        }

        public override string ToString()
        {
            return String.Join("|", cells.Select(f => (f.Piece?.ToString() ?? "").PadLeft(5)));
        }

    }
}
