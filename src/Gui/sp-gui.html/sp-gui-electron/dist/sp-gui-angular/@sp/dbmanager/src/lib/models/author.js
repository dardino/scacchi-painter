"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Author = void 0;
const helpers_1 = require("../helpers");
class Author {
    constructor() {
        this.nameAndSurname = "";
        this.address = "";
        this.city = "";
        this.phone = "";
        this.zipCode = "";
        this.stateOrProvince = "";
        this.country = "";
        this.language = "";
    }
    static fromElement(el) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const a = new Author();
        a.nameAndSurname = (_a = el.getAttribute("NameAndSurname")) !== null && _a !== void 0 ? _a : "";
        a.address = (_b = el.getAttribute("Address")) !== null && _b !== void 0 ? _b : "";
        a.city = (_c = el.getAttribute("City")) !== null && _c !== void 0 ? _c : "";
        a.phone = (_d = el.getAttribute("Phone")) !== null && _d !== void 0 ? _d : "";
        a.zipCode = (_e = el.getAttribute("ZipCode")) !== null && _e !== void 0 ? _e : "";
        a.stateOrProvince = (_f = el.getAttribute("StateOrProvince")) !== null && _f !== void 0 ? _f : "";
        a.country = (_g = el.getAttribute("Country")) !== null && _g !== void 0 ? _g : "";
        a.language = (_h = el.getAttribute("Language")) !== null && _h !== void 0 ? _h : "";
        return a;
    }
    static fromJson(el) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        const a = new Author();
        a.nameAndSurname = (_a = el.nameAndSurname) !== null && _a !== void 0 ? _a : "";
        a.address = (_b = el.address) !== null && _b !== void 0 ? _b : "";
        a.city = (_c = el.city) !== null && _c !== void 0 ? _c : "";
        a.phone = (_d = el.phone) !== null && _d !== void 0 ? _d : "";
        a.zipCode = (_e = el.zipCode) !== null && _e !== void 0 ? _e : "";
        a.stateOrProvince = (_f = el.stateOrProvince) !== null && _f !== void 0 ? _f : "";
        a.country = (_g = el.country) !== null && _g !== void 0 ? _g : "";
        a.language = (_h = el.language) !== null && _h !== void 0 ? _h : "";
        return a;
    }
    toJson() {
        const json = {};
        if (this.nameAndSurname !== "")
            json.nameAndSurname = this.nameAndSurname;
        if (this.address !== "")
            json.address = this.address;
        if (this.city !== "")
            json.city = this.city;
        if (this.phone !== "")
            json.phone = this.phone;
        if (this.zipCode !== "")
            json.zipCode = this.zipCode;
        if (this.stateOrProvince !== "")
            json.stateOrProvince = this.stateOrProvince;
        if (this.country !== "")
            json.country = this.country;
        if (this.language !== "")
            json.language = this.language;
        return json;
    }
    toSP2Xml() {
        const author = helpers_1.createXmlElement("Author");
        author.appendChild(helpers_1.newTextElement("NameAndSurname", this.nameAndSurname));
        author.appendChild(helpers_1.newTextElement("Address", this.address));
        author.appendChild(helpers_1.newTextElement("City", this.city));
        author.appendChild(helpers_1.newTextElement("Phone", this.phone));
        author.appendChild(helpers_1.newTextElement("ZipCode", this.zipCode));
        author.appendChild(helpers_1.newTextElement("StateOrProvince", this.stateOrProvince));
        author.appendChild(helpers_1.newTextElement("Country", this.country));
        author.appendChild(helpers_1.newTextElement("Language", this.language));
        return author;
    }
}
exports.Author = Author;
//# sourceMappingURL=author.js.map