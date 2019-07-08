using System;
using System.Collections.Generic;
using System.Xml.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;

namespace sp_web_gui.Models
{
    [XmlRoot(ElementName = "ScacchiPainterDatabase")]
    public class ScacchiPainterDatabase
    {

        [XmlAttribute("version")]
        public string Version { get; set; }

        [XmlAttribute("name")]
        public string Name { get; set; }

        [XmlAttribute("lastIndex")]
        public string LastIndex { get; set; }

        [XmlElement("SP_Item")]
        public List<SPItem> Problems { get; set; }
    }

    [XmlRoot(ElementName = "SP_Item")]
    public class SPItem
    {
        [XmlAttribute("ProblemType")]
        [JsonProperty("stipulationType")]
        [JsonConverter(typeof(StringEnumConverter))]
        public ProblemStipulationsType StipulationType { get; set; }//="Direct" 
        [XmlAttribute("Moves")]
        public Decimal Moves { get; set; }//="2"
        [XmlAttribute("Date")]
        public DateTime Date { get; set; } //="2010-12-16T23:00:00Z"
        [XmlAttribute("Maximum")]
        public bool Maximum { get; set; } //="false"                                  
        [XmlAttribute("Serie")]
        public bool Serie { get; set; } //="false"                                  
        [XmlAttribute("PrizeRank")]
        public string PrizeRank { get; set; } //="0"                                      
        [XmlAttribute("CompleteStipulationDesc")]
        public string CompleteStipulationDesc { get; set; } //="#"                                      
        [XmlAttribute("PersonalID")]
        public string PersonalID { get; set; } //="1"                                      
        [XmlAttribute("PrizeDescription")]
        public string PrizeDescription { get; set; } //=""                                       
        [XmlAttribute("Source")]
        public string Source { get; set; } //="Best Problems 2° 2010 - N.54 - p.2418"  
        [XmlAttribute("Stipulation")]
        public string Stipulation { get; set; } //="Mate"

        [XmlArray("Authors")]
        [XmlArrayItem(typeof(Author))]

        public List<Author> Authors { get; set; }
        [XmlArray("Pieces")]
        [XmlArrayItem(typeof(Piece))]

        public List<Piece> Pieces { get; set; }

    }

    [XmlRoot("Author")]
    public class Author
    {
        [XmlElement("NameAndSurname")] public string NameAndSurname { get; set; }
        [XmlElement("Address")] public string Address { get; set; }
        [XmlElement("City")] public string City { get; set; }
        [XmlElement("Phone")] public string Phone { get; set; }
        [XmlElement("ZipCode")] public string ZipCode { get; set; }
        [XmlElement("StateOrProvince")] public string StateOrProvince { get; set; }
        [XmlElement("Country")] public string Country { get; set; }
        [XmlElement("Language")] public string Language { get; set; }
    }

    [XmlRoot("Piece")]
    public class Piece
    {
        [XmlAttribute("Type")] public string Appearance { get; set; }
        [XmlAttribute("Code")] public string Code { get; set; }
        public bool ShouldSerializeCode() => !String.IsNullOrEmpty(Code);
        [XmlAttribute("Color")] public string Color { get; set; }
        [XmlAttribute("Column")] public string Column { get; set; }
        [XmlAttribute("Traverse")] public string Traverse { get; set; }
        [XmlAttribute("Rotation")] public string Rotation { get; set; }
        [XmlAttribute("FairyAttribute")] public string FairyAttribute { get; set; }
    }

    /*<Pieces>
			<Piece Type="Horse" Color="White" Column="ColC" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Bishop" Color="Black" Column="ColG" Traverse="Row8" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Bishop" Color="Black" Column="ColA" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColC" Traverse="Row7" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColC" Traverse="Row6" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColB" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColC" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="King" Color="Black" Column="ColD" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColE" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="White" Column="ColF" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="King" Color="White" Column="ColG" Traverse="Row5" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColE" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Queen" Color="White" Column="ColH" Traverse="Row4" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Bishop" Color="White" Column="ColA" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="White" Column="ColB" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Pawn" Color="Black" Column="ColH" Traverse="Row3" Rotation="NoRotation" FairyAttribute="None" />
			<Piece Type="Horse" Color="White" Column="ColC" Traverse="Row2" Rotation="NoRotation" FairyAttribute="None" />
		</Pieces> */

    public enum ProblemStipulationsType
    {
        Other = 0,
        Direct = 1,
        Help = 2,
        Self = 3,
        ProofGame = 4,
        ShortProofGame = 5,
        Study = 6,
        RetroAnalisys = 7,
        Reflex = 8,
        HelpSelf = 9
    }
}