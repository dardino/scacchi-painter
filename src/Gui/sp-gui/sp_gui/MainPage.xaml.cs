using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;

namespace sp_gui
{
	public partial class MainPage : MasterDetailPage
	{
		public MainPage()
		{
			InitializeComponent();

			Label header = new Label
			{
				Text = "MasterDetailPage",
				FontSize = Device.GetNamedSize(NamedSize.Large, typeof(Label)),
				HorizontalOptions = LayoutOptions.Center
			};

			// Assemble an array of NamedColor objects.
			NamedColor[] namedColors =
			{
				new NamedColor("Aqua", Color.Aqua),
				new NamedColor("Black", Color.Black),
				new NamedColor("Blue", Color.Blue),
				new NamedColor("Fucshia", Color.Fuchsia),
				new NamedColor("Gray", Color.Gray),
				new NamedColor("Green", Color.Green),
				new NamedColor("Lime", Color.Lime),
				new NamedColor("Maroon", Color.Maroon),
				new NamedColor("Navy", Color.Navy),
				new NamedColor("Olive", Color.Olive),
				new NamedColor("Purple", Color.Purple),
				new NamedColor("Red", Color.Red),
				new NamedColor("Silver", Color.Silver),
				new NamedColor("Teal", Color.Teal),
				new NamedColor("White", Color.White),
				new NamedColor("Yellow", Color.Yellow)
			};

			// Create ListView for the master page.
			ListView listView = new ListView
			{
				ItemsSource = namedColors
			};

			// Create the master page with the ListView.
			Master = new ContentPage
			{
				Title = header.Text,
				Content = new StackLayout
				{
					Children =
						  {
								header,
								listView
						  }
				}
			};

			// Create the detail page using NamedColorPage and wrap it in a
			// navigation page to provide a NavigationBar and Toggle button
			Detail = new NavigationPage(new NamedColorPage(true));
			
			// For Windows Phone, provide a way to get back to the master page.
			if (Device.RuntimePlatform == Device.WinPhone)
			{
				(Detail as ContentPage).Content.GestureRecognizers.Add(item: GestureRecogizer());
			}

			// Define a selected handler for the ListView.
			listView.ItemSelected += (sender, args) =>
			{
				// Set the BindingContext of the detail page.
				Detail.BindingContext = args.SelectedItem;

				// Show the detail page.
				IsPresented = false;
			};

			// Initialize the ListView selection.
			listView.SelectedItem = namedColors[0];


		}

		private TapGestureRecognizer GestureRecogizer()
		{
			var tgr = new TapGestureRecognizer
			{
				Command = new Command(() =>
				{
					IsPresented = true;
				})
			};
			return tgr;
		}
	}
}
