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
        public StipulationTypeEnum StipulationType { get; set; }//="Direct" 
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

}