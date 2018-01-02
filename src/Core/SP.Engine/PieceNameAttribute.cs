namespace SP.Engine
{
	[System.AttributeUsage(System.AttributeTargets.Class, Inherited = true, AllowMultiple = false)]
	sealed class PieceNameAttribute : System.Attribute
	{
		// See the attribute guidelines at 
		//  http://go.microsoft.com/fwlink/?LinkId=85236
		readonly string pieceName;

		// This is a positional argument
		public PieceNameAttribute(string pieceName)
		{
			this.pieceName = pieceName;
		}

		public string PieceName
		{
			get { return pieceName; }
		}

	}
}