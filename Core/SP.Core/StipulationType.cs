namespace SP.Core
{

	public struct StipulationType
	{
		readonly public PieceColors ColorToMove;
		readonly internal StipulationTypeEnum StEnum;
		readonly public EndTypes EndsOn;
		public string StandardNotation {
			get {
				return $"{StEnum.ToStandardString()}{EndsOn.ToStandardString()}";
			}
		}

		public override string ToString()
		{
			return StandardNotation;
		}

		internal StipulationType(StipulationTypeEnum se, EndTypes endType)
		{
			StEnum = se;
			ColorToMove = se.GetColorToMove();
			EndsOn = endType;
		}

	}
}