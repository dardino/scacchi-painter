using Xamarin.Forms;

namespace sp_gui
{
	internal class NamedColor
	{
		public string Colorname;
		public Color Color;

		public NamedColor(string v, Color colore)
		{
			Colorname = v;
			Color = colore;
		}

		public override string ToString()
		{
			return Colorname;
		}
	}
}