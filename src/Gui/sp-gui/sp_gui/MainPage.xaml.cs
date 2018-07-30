using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Xamarin.Forms;
using Xamarin.Forms.Xaml;

namespace sp_gui
{

	[XamlCompilation(XamlCompilationOptions.Compile)]
	public partial class MainPage : MasterDetailPage
	{
		public MainPage()
		{
			InitializeComponent();

			MasterBehavior = MasterBehavior.Popover;

			StackLayout header = new StackLayout
			{
				BackgroundColor = Color.White,
				HorizontalOptions = LayoutOptions.FillAndExpand,
				Children = {
					new Label {
						HorizontalOptions = LayoutOptions.Center,
						Text = "Main Page",
						FontSize = Device.GetNamedSize(NamedSize.Large, typeof(Label)),
					}
				}
			};

			// Assemble an array of NamedColor objects.
			NamedColor[] namedColors =
			{
				new NamedColor("Transparent", Color.Transparent),
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
				BackgroundColor = Color.FromRgba(255, 255, 255, 0.4),
				Margin = new Thickness(10),
				ItemsSource = namedColors
			};

			// backGroundImage
			var bgImage = new Image { Source = "bg.png", Aspect = Aspect.AspectFill, };
			AbsoluteLayout.SetLayoutBounds(bgImage, new Rectangle(0, 0, 1, 1));
			AbsoluteLayout.SetLayoutFlags(bgImage, AbsoluteLayoutFlags.All);
			// lista opzioni
			var listaOpzioni = new StackLayout
			{
				Children = { header, listView }
			};
			AbsoluteLayout.SetLayoutBounds(listaOpzioni, new Rectangle(0, 0, 1, 1));
			AbsoluteLayout.SetLayoutFlags(listaOpzioni, AbsoluteLayoutFlags.All);
			// Menu Layout Page
			var absoluteLayout = new AbsoluteLayout
			{
				VerticalOptions = LayoutOptions.FillAndExpand,
				HorizontalOptions = LayoutOptions.FillAndExpand,
			};
			absoluteLayout.Children.Add(bgImage);
			absoluteLayout.Children.Add(listaOpzioni);

			// Create the master page with the ListView.
			Master = new ContentPage
			{
				Title = "Scacchi Painter",
				Content = absoluteLayout,
				Icon = "hamburger.png",
				BackgroundImage = "bg.png"
			};

			// Create the detail page using NamedColorPage and wrap it in a
			// navigation page to provide a NavigationBar and Toggle button
			Detail = new NavigationPage(new NamedColorPage(true)) {
				BackgroundColor = Color.Transparent,
				Icon = "hamburger.png",
				Title = "Navigation Page",
				BarBackgroundColor = Color.Transparent,
				BarTextColor = Color.White
			};

			// For Windows Phone, provide a way to get back to the master page.
			//if (Device.RuntimePlatform == Device.WinPhone || Device.RuntimePlatform == Device.Windows)
			//{
			//	((Detail as NavigationPage).CurrentPage as NamedColorPage).Content.GestureRecognizers.Add(item: GestureRecogizer());
			//}

			var firstTime = true;
			// Define a selected handler for the ListView.
			listView.ItemSelected += (sender, args) =>
			{
				if (!firstTime)
				{
					var c = Plugin.FilePicker.CrossFilePicker.Current.PickFile();
					c.Wait();
					var x = c.Result;
				}
				firstTime = false;
				// Set the BindingContext of the detail page.
				Detail.BindingContext = args.SelectedItem;

				((Detail as NavigationPage).CurrentPage as NamedColorPage).SetColor((args.SelectedItem as NamedColor).Color);

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
