using Xamarin.Forms;

namespace sp_gui
{
	internal class NamedColorPage : ContentPage
	{
		private bool v;

		public void SetColor(Color color)
		{
			BackgroundColor = color;
		}

		public NamedColorPage(bool v)
		{
			this.v = v;
			Label header = new Label
			{
				Text = "MasterDetailPage",
				FontSize = Device.GetNamedSize(NamedSize.Large, typeof(Label)),
				HorizontalOptions = LayoutOptions.Center
			};

			Content = header;
		}
	}
}