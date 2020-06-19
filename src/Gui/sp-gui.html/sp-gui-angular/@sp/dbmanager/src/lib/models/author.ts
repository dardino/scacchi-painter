import { Author as IAuthor } from "../helpers";

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
    a.nameAndSurname = el.getAttribute("NameAndSurname") ?? "";
    a.address = el.getAttribute("Address") ?? "";
    a.city = el.getAttribute("City") ?? "";
    a.phone = el.getAttribute("Phone") ?? "";
    a.zipCode = el.getAttribute("ZipCode") ?? "";
    a.stateOrProvince = el.getAttribute("StateOrProvince") ?? "";
    a.country = el.getAttribute("Country") ?? "";
    a.language = el.getAttribute("Language") ?? "";
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
    return json;
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
