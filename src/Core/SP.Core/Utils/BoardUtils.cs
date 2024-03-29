using System;
using System.Collections.Generic;
using System.Linq;
using SP.Core.Utils;

namespace SP.Core.Utils
{
    public static class BoardUtils
    {
        public static Board FromNotation(string notation, Stipulation stipulation)
        {
            var board = FromNotation(notation);
            board.Stipulation = stipulation;
            return board;
        }
        public static Board FromNotation(string notation)
        {
            Board b = new Board();
            FromFEN(b, notation);
            return b;
        }
		private static void FromFEN(Board board, string FEN_adp)
		{
			string[] fenParts = FEN_adp.Split('|');

			//caricamento dei pezzi

			string[] traverse = fenParts[0].Split('/');
			int nt = -1;
			foreach (string mytr in traverse)
			{
				nt++;
				ParseTraversa(board, mytr, 7 - nt);
			}

			// caricamento delle altre info
			if (fenParts.Length > 1) {

			}

		}
		private static void ParseTraversa(Board board, string mytr, int nt) {
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

				PlacePieceOnBoard(board, numcol, numtra, PieceBaseUtils.FromFEN(c));
			}
		}

		/** restituisce true se il pezzo termina dove ce n'è un altro */
		public static bool PlacePieceOnBoard(Board board, Square sq, PieceBase piece)
		{
			return board.Cells[(uint)sq].SetPiece(piece);
		}
		public static void PlacePieceOnBoard(Board board, Columns col, Rows row, PieceBase piece)
		{
			PlacePieceOnBoard(board, BoardSquare.GetSquareIndex(col, row), piece);
		}

		private static string PrepareTraversa(string traversa) {
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
		public static string[] GetRepresentation(params Board[] boards)
		{
			var bb2p = boards.Length;

			List<string> outtext = new List<string>();
			var top = "";
			for (var bb = 0; bb < bb2p; bb++)
			{
				top += "╔═══╤═══╤═══╤═══╤═══╤═══╤═══╤═══╗";
			}
			outtext.Add(top);
			for (int r = 7; r > -1; r--)
			{
				var globalRow = "";
				for (var bb = 0; bb < bb2p; bb++)
				{
					var row = "";
					for (int c = 7; c > -1; c--)
					{
						var sqi = (int)BoardSquare.GetSquareIndex((Columns)c, (Rows)r);
						row += $@"{(boards[bb].Cells[sqi].Occupied ? boards[bb].Cells[sqi].Piece.NameByColor.PadRight(2, ' ').PadLeft(3, ' ') : "   ")}";
						if (c > 0) row += "│";
					}
					globalRow += "║" + row + "║";
				}
				outtext.Add(globalRow);
			}
			var bot = "";
			for (var bb = 0; bb < bb2p; bb++)
			{
				bot += "╚═══╧═══╧═══╧═══╧═══╧═══╧═══╧═══╝";
			}
			outtext.Add(bot);
			for (var bb = 0; bb < bb2p; bb++)
			{
				outtext.Add(bb + ":");
				outtext.Add(ToFEN(boards[bb]));
			}

#if DEBUG
			System.Diagnostics.Debug.WriteLine(String.Join("\r\n", outtext));
			return new string[0];
#else
			return outtext.ToArray();
#endif
		}

        
		private static string ToFEN(Board board)
		{
            if (board is null)
            {
                throw new ArgumentNullException(nameof(board));
            }

            return "";
		}


    }

}
