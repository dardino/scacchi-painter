// tslint:disable: one-variable-per-declaration
// tslint:disable: no-bitwise

/**
 *  Base64 encode / decode
 *  http://www.webtoolkit.info
 *
 * @export
 */
export class Base64 {
  private static keyStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  // private property

  // public method for encoding
  public static encode(input: string) {
    if ((input ?? "") === "") return "";
    let output = "";
    let chr1: number,
      chr2: number,
      chr3: number,
      enc1: number,
      enc2: number,
      enc3: number,
      enc4: number;
    let i = 0;

    input = Base64._utf8_encode(input);

    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }

      output =
        output +
        Base64.keyStr.charAt(enc1) +
        Base64.keyStr.charAt(enc2) +
        Base64.keyStr.charAt(enc3) +
        Base64.keyStr.charAt(enc4);
    } // Whend

    return output;
  } // End Function encode

  // public method for decoding
  public static decode(input: string) {
    if ((input ?? "") === "") return "";
    let output = "";
    let chr1: number, chr2: number, chr3: number;
    let enc1: number, enc2: number, enc3: number, enc4: number;
    let i = 0;

    input = input.replace(/[^A-Za-z0-9\+\/\=]/g, "");
    while (i < input.length) {
      enc1 = Base64.keyStr.indexOf(input.charAt(i++));
      enc2 = Base64.keyStr.indexOf(input.charAt(i++));
      enc3 = Base64.keyStr.indexOf(input.charAt(i++));
      enc4 = Base64.keyStr.indexOf(input.charAt(i++));

      chr1 = (enc1 << 2) | (enc2 >> 4);
      chr2 = ((enc2 & 15) << 4) | (enc3 >> 2);
      chr3 = ((enc3 & 3) << 6) | enc4;

      output = output + String.fromCharCode(chr1);

      if (enc3 !== 64) {
        output = output + String.fromCharCode(chr2);
      }

      if (enc4 !== 64) {
        output = output + String.fromCharCode(chr3);
      }
    } // Whend

    output = Base64._utf8_decode(output);

    return output;
  } // End Function decode

  // private method for UTF-8 encoding
  private static _utf8_encode(textString: string) {
    let utftext = "";
    textString = textString.replace(/\r\n/g, "\n");

    for (let n = 0; n < textString.length; n++) {
      const c = textString.charCodeAt(n);

      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if (c > 127 && c < 2048) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    } // Next n

    return utftext;
  } // End Function _utf8_encode

  // private method for UTF-8 decoding
  private static _utf8_decode(utftext: string) {
    let textString = "";
    let i = 0;
    let c: number, c1: number, c2: number, c3: number;
    c = c1 = c2 = 0;

    while (i < utftext.length) {
      c = utftext.charCodeAt(i);

      if (c < 128) {
        textString += String.fromCharCode(c);
        i++;
      } else if (c > 191 && c < 224) {
        c2 = utftext.charCodeAt(i + 1);
        textString += String.fromCharCode(((c & 31) << 6) | (c2 & 63));
        i += 2;
      } else {
        c2 = utftext.charCodeAt(i + 1);
        c3 = utftext.charCodeAt(i + 2);
        textString += String.fromCharCode(
          ((c & 15) << 12) | ((c2 & 63) << 6) | (c3 & 63)
        );
        i += 3;
      }
    } // Whend

    return textString;
  } // End Function _utf8_decode
}
