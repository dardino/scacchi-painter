using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SP.Core
{
	public class Board : IDisposable
	{

		public BoardSquare this[int index]
		{
			get {
				return cells[index];
			}
		}

		private BoardSquare[] cells = new BoardSquare[64];
		public BoardSquare[] Cells => cells;
		public int WhiteCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.White ? 1 : 0);
		public int BlackCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.Black ? 1 : 0);
		public int NeutralCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.Neutral ? 1 : 0);
		public int TotalCount => cells.Sum(c => c.Occupied ? 1 : 0);

		public Stipulation Stipulation { get; private set; } = new Stipulation(2);

		public PieceBase GetPiece(Square sq)
		{
			return this[(int)sq].Piece;
		}
		public PieceBase GetPiece(Columns col, Rows row) {
			return GetPiece(BoardSquare.GetSquareIndex(col, row));
		}

		public Board()
		{
			for (int i = 0; i < 64; i++)
			{
				cells[i] = new BoardSquare((Square)i);
			}
		}

		public void PlacePieceOnBoard(Square sq, PieceBase piece)
		{
			cells[(int)sq].SetPiece(piece);
		}
		public void PlacePieceOnBoard(Columns col, Rows row, PieceBase piece)
		{
			PlacePieceOnBoard(BoardSquare.GetSquareIndex(col, row), piece);
		}

		public static Board FromNotation(string notation, Stipulation stipulation)
		{
			var board = FromNotation(notation);
			board.Stipulation = stipulation;
			return board;
		}
		public static Board FromNotation(string notation)
		{
			Board b = new Board();
			b.FromFEN(notation);
			return b;
		}

		private void FromFEN(string FEN_adp)
		{
			string[] fenParts = FEN_adp.Split('|');

			//caricamento dei pezzi

			string[] traverse = fenParts[0].Split('/');
			int nt = -1;
			foreach (string mytr in traverse)
			{
				nt++;
				ParseTraversa(mytr, 7 - nt);
			}

			// caricamento delle altre info
			if (fenParts.Length > 1) {

			}

		}

		private void ParseTraversa(string mytr, int nt) {
			string traversa = PrepareTraversa(mytr);

			// ora per ogni colonna nella traversa controllo cosa contiene:
			int nc = -1;
			foreach (string c in traversa.Split('|'))
			{
				nc++;
				// se vuota continuo la lettura
				if (c.Trim() == "#") continue;
				if (String.IsNullOrEmpty(c)) continue;

				// ora calcolo la traversa e la colonna (la colonna A ha indice 7):
				Columns numcol = (Columns)(7 - nc);
				Rows numtra = (Rows)(nt);

				PlacePieceOnBoard(numcol, numtra, PieceBase.FromFEN(c));
			}
		}

		private string PrepareTraversa(string traversa) {
			// potrebbe essere: 
			traversa = traversa.Replace("K", "|K");
			traversa = traversa.Replace("k", "|k");
			traversa = traversa.Replace("Q", "|Q");
			traversa = traversa.Replace("q", "|q");
			traversa = traversa.Replace("N", "|N");
			traversa = traversa.Replace("n", "|n");
			traversa = traversa.Replace("S", "|N");
			traversa = traversa.Replace("s", "|n");
			traversa = traversa.Replace("B", "|B");
			traversa = traversa.Replace("b", "|b");
			traversa = traversa.Replace("R", "|R");
			traversa = traversa.Replace("r", "|r");
			traversa = traversa.Replace("P", "|P");
			traversa = traversa.Replace("p", "|p");
			traversa = traversa.Replace("A", "|A");
			traversa = traversa.Replace("a", "|a");
			traversa = traversa.Replace("E", "|E");
			traversa = traversa.Replace("e", "|e");
			traversa = traversa.Replace("T", "|T");
			traversa = traversa.Replace("t", "|t");
			// rimpiazzo i precedenti se erano neutri e non colorati
			traversa = traversa.Replace("*|K", "|*K");
			traversa = traversa.Replace("*|Q", "|*Q");
			traversa = traversa.Replace("*|N", "|*N");
			traversa = traversa.Replace("*|S", "|*N");
			traversa = traversa.Replace("*|B", "|*B");
			traversa = traversa.Replace("*|R", "|*R");
			traversa = traversa.Replace("*|P", "|*P");
			traversa = traversa.Replace("*|A", "|*A");
			traversa = traversa.Replace("*|E", "|*E");
			traversa = traversa.Replace("*|T", "|*T");
			traversa = traversa.Replace("*|k", "|*K");
			traversa = traversa.Replace("*|q", "|*Q");
			traversa = traversa.Replace("*|n", "|*N");
			traversa = traversa.Replace("*|s", "|*N");
			traversa = traversa.Replace("*|b", "|*B");
			traversa = traversa.Replace("*|r", "|*R");
			traversa = traversa.Replace("*|p", "|*P");
			traversa = traversa.Replace("*|a", "|*A");
			traversa = traversa.Replace("*|e", "|*E");
			traversa = traversa.Replace("*|t", "|*T");
			// ora controllo se ci sono rotazioni (":")
			traversa = traversa.Replace(":0", "+ ");
			traversa = traversa.Replace(":1", "+/");
			traversa = traversa.Replace(":2", "+-");
			traversa = traversa.Replace(":3", "+\\");
			traversa = traversa.Replace(":4", "- ");
			traversa = traversa.Replace(":5", "-/");
			traversa = traversa.Replace(":6", "--");
			traversa = traversa.Replace(":7", "-\\");
			// ora rimpiazzo le celle vuote:
			traversa = traversa.Replace("8", "|#|#|#|#|#|#|#|#");
			traversa = traversa.Replace("7", "|#|#|#|#|#|#|#");
			traversa = traversa.Replace("6", "|#|#|#|#|#|#");
			traversa = traversa.Replace("5", "|#|#|#|#|#");
			traversa = traversa.Replace("4", "|#|#|#|#");
			traversa = traversa.Replace("3", "|#|#|#");
			traversa = traversa.Replace("2", "|#|#");
			traversa = traversa.Replace("1", "|#");
			// tolgo il primo Pipe
			traversa = traversa.Trim('|');
			return traversa;
		}

		public Board Clone()
		{
			var b = new Board {
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
