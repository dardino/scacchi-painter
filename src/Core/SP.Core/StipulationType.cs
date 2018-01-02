namespace SP.Core
{

	public struct StipulationType
	{
		public static readonly StipulationType DirectMate        = new StipulationType(StipulationTypeEnum.Direct  , EndTypes.Mate);
		public static readonly StipulationType HelpMate          = new StipulationType(StipulationTypeEnum.Help    , EndTypes.Mate);
		public static readonly StipulationType SelfMate          = new StipulationType(StipulationTypeEnum.Self    , EndTypes.Mate);
		public static readonly StipulationType HelpSelfMate      = new StipulationType(StipulationTypeEnum.HelpSelf, EndTypes.Mate);

		public static readonly StipulationType DirectStaleMate   = new StipulationType(StipulationTypeEnum.Direct  , EndTypes.StaleMate);
		public static readonly StipulationType HelpStaleMate     = new StipulationType(StipulationTypeEnum.Help    , EndTypes.StaleMate);
		public static readonly StipulationType SelfStaleMate     = new StipulationType(StipulationTypeEnum.Self    , EndTypes.StaleMate);
		public static readonly StipulationType HelpSelfStaleMate = new StipulationType(StipulationTypeEnum.HelpSelf, EndTypes.StaleMate);

		public PieceColors ColorToMove { get; private set; }
		internal StipulationTypeEnum StEnum { get; private set; }

		public EndTypes EndsOn { get; private set; }
		public string StandardNotation {
			get {
				return $"{StEnum.ToStandardString()}{EndsOn.ToStandardString()}";
			}
		}

		public override string ToString()
		{
			return StandardNotation;
		}

		private StipulationType(StipulationTypeEnum se, EndTypes endType)
		{
			StEnum = se;
			ColorToMove = se.GetColorToMove();
			EndsOn = endType;
		}

	}
}