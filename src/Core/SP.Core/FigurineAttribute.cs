using System;

namespace SP.Core
{
	public class FigurineAttribute : Attribute
	{
		private PieceFigurine figurine = PieceFigurine.None;
		public PieceFigurine Value {
			get { return figurine; }
		}
		public FigurineAttribute(PieceFigurine figurine)
		{
			this.figurine = figurine;
		}
	}
}