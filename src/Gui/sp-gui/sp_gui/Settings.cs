using System;
using System.Collections.Generic;
using System.Text;
using Plugin.Settings;
using Plugin.Settings.Abstractions;

namespace sp_gui
{
	/// <summary>
	/// This is the Settings static class that can be used in your Core solution or in any
	/// of your client applications. All settings are laid out the same exact way with getters
	/// and setters. 
	/// </summary>
	public static class Settings
	{
		private static ISettings AppSettings
		{
			get
			{
				return CrossSettings.Current;
			}
		}

		#region Setting LastFileName
		private const string lastFileName = "last_file_name";
		private static readonly string lastFileNameDefault = "temp.sp3";
		public static string LastFileName
		{
			get
			{
				return AppSettings.GetValueOrDefault(lastFileName, lastFileNameDefault);
			}
			set
			{
				AppSettings.AddOrUpdateValue(lastFileName, value);
			}
		}
		#endregion

	}
}
