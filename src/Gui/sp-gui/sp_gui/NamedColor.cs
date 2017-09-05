using Xamarin.Forms;

namespace sp_gui
{
	internal class NamedColor
	{
		private string colorname;
		private Color color;

		public NamedColor(string v, Color colore)
		{
			this.colorname = v;
			this.color = colore;
		}

		public override string ToString()
		{
			return colorname;
		}
	}
}