using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace SP.Core
{
	public class Board
	{
		public Cell this[int index]
		{
			get {
				return cells[index];
			}
		}

		private Cell[] cells = new Cell[64];
		public int WhiteCount   => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.White ? 1 : 0);
		public int BlackCount   => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.Black ? 1 : 0);
		public int NeutralCount => cells.Sum(c => c.Occupied && c.Piece.Color == PieceColors.Neutral ? 1 : 0);
		public int TotalCount => cells.Sum(c => c.Occupied ? 1 : 0);

		public PieceBase GetPiece(Columns col, Rows row) {
			return this[indexFromCoord(col, row)].Piece;
		}

		private static int indexFromCoord(Columns col, Rows row)
		{
			return (int)col + (int)row * 8;
		}

		public Board()
		{
			for (int i = 0; i < 64; i++)
			{
				cells[i] = new Cell(i);
			}
		}

		public void PlacePieceOnBoard(Columns col, Rows row, PieceBase piece)
		{
			cells[indexFromCoord(col, row)].SetPiece(piece);
		}

		public static Board FromNotation(string notation)
		{
			Board b = new Board();
			b.fromFEN(notation);
			return b;
		}

		private void fromFEN(string FEN_adp)
		{
			string[] traverse = FEN_adp.Split('/');
			int nt = -1;
			foreach (string mytr in traverse)
			{
				nt++;
				string traversa = mytr;
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
				// ora per ogni colonna nella traversa controllo cosa contiene:
				int nc = -1;
				foreach (string c in traversa.Split('|'))
				{
					nc++;
					// se vuota continuo la lettura
					if (c.Trim() == "#") continue;
					if (String.IsNullOrEmpty(c)) continue;

					// ora calcolo la traversa e la colonna:
					Columns numcol = (Columns)(nc);
					Rows numtra = (Rows)(nt);

					PlacePieceOnBoard(numcol, numtra, PieceBase.FromFEN(c));
				}
			}
		}
	}
}
