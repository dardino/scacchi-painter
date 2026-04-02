using System.Collections.Generic;

namespace SP.Core
{
	public enum EndTypes
	{
		Undefined,
		Mate,
		StaleMate
	}

	public static class EndTypesEx {
		private static readonly Dictionary<EndTypes, string> endTypesStrings = new Dictionary<EndTypes, string> {
			{ EndTypes.Mate     , "\u2260" },
			{ EndTypes.StaleMate, "\u003D" },
			{ EndTypes.Undefined, "" }
		};

		public static string ToStandardString(this EndTypes t)	{
			return endTypesStrings[t];
		}
	}
}
