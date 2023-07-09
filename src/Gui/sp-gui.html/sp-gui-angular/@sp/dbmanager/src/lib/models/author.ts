import { Author as IAuthor, newTextElement, createXmlElement } from "../helpers";

export class Author implements IAuthor {
  nameAndSurname: string;
  address: string;
  city: string;
  phone: string;
  zipCode: string;
  stateOrProvince: string;
  country: string;
  language: string;

  public static fromElement(el: Element): Author {
    const a = new Author();
    a.nameAndSurname = el.querySelector("NameAndSurname")?.innerHTML ?? "";
    a.address =  el.querySelector("Address")?.innerHTML ?? "";
    a.city =  el.querySelector("City")?.innerHTML ?? "";
    a.phone =  el.querySelector("Phone")?.innerHTML ?? "";
    a.zipCode =  el.querySelector("ZipCode")?.innerHTML ?? "";
    a.stateOrProvince =  el.querySelector("StateOrProvince")?.innerHTML ?? "";
    a.country =  el.querySelector("Country")?.innerHTML ?? "";
    a.language =  el.querySelector("Language")?.innerHTML ?? "";
    return a;
  }
  static fromJson(el: Partial<IAuthor>): Author {
    const a = new Author();
    a.nameAndSurname = el.nameAndSurname ?? "";
    a.address = el.address ?? "";
    a.city = el.city ?? "";
    a.phone = el.phone ?? "";
    a.zipCode = el.zipCode ?? "";
    a.stateOrProvince = el.stateOrProvince ?? "";
    a.country = el.country ?? "";
    a.language = el.language ?? "";
    return a;
  }

  toJson(): Partial<IAuthor> {
    const json: Partial<IAuthor> = {};
    if (this.nameAndSurname !== "") json.nameAndSurname = this.nameAndSurname;
    if (this.address !== "") json.address = this.address;
    if (this.city !== "") json.city = this.city;
    if (this.phone !== "") json.phone = this.phone;
    if (this.zipCode !== "") json.zipCode = this.zipCode;
    if (this.stateOrProvince !== "") json.stateOrProvince = this.stateOrProvince;
    if (this.country !== "") json.country = this.country;
    if (this.language !== "") json.language = this.language;
    return json;
  }

  toSP2Xml(): Element {
    const author = createXmlElement("Author");
    author.appendChild(newTextElement("NameAndSurname", this.nameAndSurname));
    author.appendChild(newTextElement("Address", this.address));
    author.appendChild(newTextElement("City", this.city));
    author.appendChild(newTextElement("Phone", this.phone));
    author.appendChild(newTextElement("ZipCode", this.zipCode));
    author.appendChild(newTextElement("StateOrProvince", this.stateOrProvince));
    author.appendChild(newTextElement("Country", this.country));
    author.appendChild(newTextElement("Language", this.language));
    return author;
  }

  private constructor() {
    this.nameAndSurname = "";
    this.address = "";
    this.city = "";
    this.phone = "";
    this.zipCode = "";
    this.stateOrProvince = "";
    this.country = "";
    this.language = "";
  }
}
