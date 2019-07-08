using System;
using System.Collections.Generic;
using System.Xml.Serialization;
using Newtonsoft.Json;
using Newtonsoft.Json.Converters;
using SP.Core;

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
        public StipulationTypeEnum StipulationType { get; set; }
        [XmlAttribute("Moves")]
        public Decimal Moves { get; set; }

        [XmlAttribute("Date")]

        public DateTime Date { get; set; }
        [XmlAttribute("Maximum")]
        public bool Maximum { get; set; }
        [XmlAttribute("Serie")]
        public bool Serie { get; set; }
        [XmlAttribute("PrizeRank")]
        public string PrizeRank { get; set; }
        [XmlAttribute("CompleteStipulationDesc")]
        public string CompleteStipulationDesc { get; set; }
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

        [XmlElement("Solution")]
        public String OldSolution { get; set; }

        [XmlElement("SolutionRtf")]
        public String OldRtfSolution { get; set; }

        public String MdSolution { get; set; }

        [XmlArray("Twins")]
        [XmlArrayItem(typeof(Twin))]
        public List<Twin> Twins { get; set; }

        [XmlArray("Tags")]
        [XmlArrayItem(typeof(Tag))]
        public List<Tag> Tags { get; set; }

        [XmlArray("Conditions")]
        [XmlArrayItem(typeof(Condition))]
        public List<Condition> Conditions { get; set; }

        /*
        <Conditions>
        <Condition Value="Sentinelles" />
        </Conditions>
        */

    }

    [XmlRoot("Twin")]
    public class Twin
    {
        [JsonConverter(typeof(StringEnumConverter))]
        public TwinTypes TwinType { get; set; }
        public string ValueA { get; set; }
        public string ValueB { get; set; }
        public string ValueC { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        public TwinModes TwinMode { get; set; }
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
        [JsonConverter(typeof(StringEnumConverter))]
        [XmlAttribute("Type")] public PieceFigurine Appearance { get; set; }
        [JsonIgnore] [XmlElement("FairyType")] public FairyType FairyType { get; set; }

        [JsonProperty("fairyCode")]
        [XmlElement("Code")]
        public string Code
        {
            get
            {
                return this.FairyType?.Code;
            }
            set
            {
                this.FairyType = new FairyType(value);
            }
        }
        public bool ShouldSerializeCode() => !String.IsNullOrEmpty(Code);
        [JsonConverter(typeof(StringEnumConverter))]
        [XmlAttribute("Color")] public PieceColors Color { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        [XmlAttribute("Column")] public Columns Column { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        [XmlAttribute("Traverse")] public Rows Traverse { get; set; }
        [JsonConverter(typeof(StringEnumConverter))]
        [XmlAttribute("Rotation")] public PieceRotation Rotation { get; set; }
        [XmlAttribute("FairyAttribute")] public string FairyAttribute { get; set; }
    }

    public class FairyType
    {

        public FairyType() { }
        public FairyType(string value)
        {
            this.Code = value;
        }

        [XmlAttribute("code")] public String Code { get; set; }
    }
    public enum TwinTypes
    {
        Diagram = 0,                // no values
        MovePiece = 1,              // 2 values
        RemovePiece = 2,            // 1 value
        AddPiece = 3,               // 2 values
        Substitute = 4,             // 3 values
        SwapPieces = 5,             // 2 values
        Rotation90 = 6,             // no value
        Rotation180 = 7,            // no value
        Rotation270 = 8,            // no value
        TraslateNormal = 9,         // 2 value
        TraslateToroidal = 10,      // 2 value
        MirrorHorizontal = 11,      // no value
        MirrorVertical = 12,        // no value
        ChangeProblemType = 13,     // 2 value
        Duplex = 14,                // no value
        AfterKey = 15,              // no value
        SwapColors = 16,            // no value
        Stipulation = 17            // 1 value
    }
    public enum TwinModes
    {
        Normal = 0,
        Combined = 1
    }

    [XmlRoot("Tag")]
    public class Tag
    {

        [XmlAttribute("Value")]
        public string Value { get; set; }

    }


    [XmlRoot("Condition")]
    public class Condition
    {
        [XmlAttribute("Value")]
        public string Value { get; set; }
    }

}


