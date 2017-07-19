using System;
using System.Collections.Generic;
using System.Linq;

namespace SP.Core
{
	public abstract class PieceBase
	{
		public PieceColors Color { get; set; } = PieceColors.Neutral;
		public PieceRotation Rotation { get; set; } = PieceRotation.NoRotation;

		internal static Dictionary<PieceRotation, string> rotationsMap = new Dictionary<PieceRotation, string> {
			{  PieceRotation.NoRotation, @"+ " },
			{  PieceRotation.Clockwise45, @"+/" },
			{  PieceRotation.Clockwise90, @"+-" },
			{  PieceRotation.Clockwise135, @"+\" },
			{  PieceRotation.UpsideDown, @"- " },
			{  PieceRotation.Counterclockwise135, @"-/" },
			{  PieceRotation.Counterclockwise90, @"--" },
			{  PieceRotation.Counterclockwise45, @"-\" }
		};
		internal static Dictionary<char, PieceFigurine> pieceSymbolMap = new Dictionary<char, PieceFigurine> {
			{ 'K', PieceFigurine.King },
			{ 'Q', PieceFigurine.Queen },
			{ 'N', PieceFigurine.Horse },
			{ 'B', PieceFigurine.Bishop },
			{ 'R', PieceFigurine.Rock },
			{ 'P', PieceFigurine.Pawn },
			{ 'A', PieceFigurine.Bishop },
			{ 'E', PieceFigurine.Queen },
			{ 'S', PieceFigurine.Horse },
			{ 'T', PieceFigurine.Rock }
		};
		internal static List<Type> piecetypes = typeof(PieceBase).Assembly.GetTypes().Where(f => f.BaseType == typeof(PieceBase)).ToList();

		internal static PieceBase FromFEN(string c)
		{
			// leggo prima il colore:
			PieceColors colore = PieceColors.Neutral;
			char[] cc = c.ToCharArray();
			Char stcol = cc[0];
			if (stcol == '*')
			{
				colore = PieceColors.Neutral;
				stcol = cc[1];
			}
			else if (Char.IsUpper(stcol)) colore = PieceColors.White;
			else colore = PieceColors.Black;
			// una volta trovato il colore metto il pezzo in maiuscolo:
			stcol = Char.ToUpper(stcol);
			// ora decodifico il pezzo:
			PieceFigurine tipo = pieceSymbolMap[stcol];
			// ora genero il pezzo:
			PieceBase pezzo = MakePieceClass(tipo, stcol.ToString());
			// gli applico il colore:
			pezzo.Color = colore;
			// quindi cerco la rotazione:
			string rotstr = "+ ";
			if (c.Length == 3) rotstr = c.Substring(1, 2);
			if (c.Length == 4) rotstr = c.Substring(2, 2);
			var rotMap = rotationsMap.Where(f => f.Value == rotstr);
			PieceRotation rotazione = PieceRotation.NoRotation;
			if (rotMap.Count() > 0) rotazione = rotMap.First().Key;
			// e la applico:
			pezzo.Rotation = rotazione;
			// ora aggiungo il pezzo alla lista pezzi:
			return pezzo;
		}

		private static PieceBase MakePieceClass(PieceFigurine tipo, string name)
		{
			var type = findClass(tipo, name);
			if (type == null) return null;
			var instance = Activator.CreateInstance(type) as PieceBase;
			return instance;
		}

		private static Type findClass(PieceFigurine tipo, string name)
		{
			var filtered = piecetypes
				.Where(p =>
						(p.GetCustomAttributes(false)
						.Where(f => f.GetType() == typeof(FigurineAttribute))
						.FirstOrDefault() as FigurineAttribute).Value == tipo
			);

			return filtered.FirstOrDefault();
		}
	}
}
