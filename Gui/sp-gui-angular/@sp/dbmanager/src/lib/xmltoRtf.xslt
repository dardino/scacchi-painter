<?xml version="1.0" encoding="Windows-1252"?>
<!-- $Id: xhtml2rtf.xsl 166 2005-12-15 09:38:34Z wpc0756\Emmanuel $ -->
<!--

    Copyright (C) 2004 Emmanuel KARTMANN (emmanuel@kartmann.org)

    This library is free software; you can redistribute it and/or
    modify it under the terms of the GNU Lesser General Public
    License as published by the Free Software Foundation; either
    version 2.1 of the License, or (at your option) any later version.

    This library is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
    Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public
    License along with this library; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA 02111-1307 USA

    http://www.gnu.org/licenses/lgpl.txt

-->
<xsl:stylesheet xmlns:xhtml="http://www.w3.org/1999/xhtml" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:msxsl="urn:schemas-microsoft-com:xslt" xmlns:xhtml2rtf="http://www.lutecia.info/download/xmlns/xhtml2rtf" version="1.0">
  <xsl:output method="text" encoding="Windows-1252" omit-xml-declaration="yes" indent="no" />

  <!--
       NOTE ON RTF:
       ============
       RTF uses a measurement unit called "TWIPS"

       1 TWIPS = 1/20 of POINT
       1 POINT = 1/72 of INCH

       Thus, 1 CM = 567 TWIPS
    -->

  <!-- ***************************************************************************************************** -->
  <!-- SUB-ROUTINES AND VARIABLES (CUSTOMIZABLE) -->
  <!-- ***************************************************************************************************** -->

  <!--   ==================================================== -->
  <!--   PAGE SETUP -->
  <!--   ==================================================== -->

  <!--     * Paper start number (defaults: 1) -->
  <xsl:param name="page-start-number" select="1" />

  <!--     * Paper width in TWIPS -->
  <xsl:param name="page-setup-paper-width" select="11907" /> <!-- 11907 TWIPS = 21 cm (A4 format)-->

  <!--     * Paper height in TWIPS -->
  <xsl:param name="page-setup-paper-height" select="16840" /> <!-- 16840 TWIPS = 29.7 cm (A4 format) -->

  <!--     * Top margin in TWIPS -->
  <xsl:param name="page-setup-margin-top" select="1440" /> <!-- 1440 TWIPS = 1 inch = 2.54 cm -->

  <!--     * Bottom margin in TWIPS -->
  <xsl:param name="page-setup-margin-bottom" select="1440" /> <!-- 1440 TWIPS = 1 inch = 2.54 cm -->

  <!--     * Left margin in TWIPS -->
  <xsl:param name="page-setup-margin-left" select="1134" /> <!-- 1134 TWIPS = 2 cm -->

  <!--     * Right margin in TWIPS -->
  <xsl:param name="page-setup-margin-right" select="1134" /> <!-- 1134 TWIPS = 2 cm -->

  <!--   ==================================================== -->
  <!--   FONTS -->
  <!--   ==================================================== -->

  <!--     * Default font size in TWIPS -->
  <xsl:param name="font-size-default" select="20" /> <!-- 20 TWIPS = 10 pt. -->

  <!--     * Default font name -->
  <xsl:param name="font-name-default" select="'Times New Roman'" />

  <!--     * Default font name for fixed-width text (like PRE or CODE) -->
  <xsl:param name="font-name-fixed" select="'Courier New'" /> <!-- Fixed-with font -->

  <!--     * Barcode font name -->
  <xsl:param name="font-name-barcode" select="'3 of 9 Barcode'" /> <!-- Barcode font -->

  <!--   ==================================================== -->
  <!--   HEADER AND FOOTER -->
  <!--   ==================================================== -->

  <!--     * Header default font size in TWIPS -->
  <xsl:param name="header-font-size-default" select="14" /> <!-- 14 TWIPS = 7 pt. -->

  <!--     * Default distance between top of page and top of header, in TWIPS -->
  <xsl:param name="header-distance-from-edge" select="720" /> <!-- 720 TWIPS = 1.27 cm -->

  <!--     * Header left indentation in TWIPS -->
  <xsl:param name="header-indentation-left" select="0" />

  <!--     * Footer default font size in TWIPS -->
  <xsl:param name="footer-font-size-default" select="14" /> <!-- 14 TWIPS = 7 pt. -->

  <!--     * Default distance between bottom of page and bottom of footer, in TWIPS -->
  <xsl:param name="footer-distance-from-edge" select="720" /> <!-- Distance between bottom of page and bottom of footer (720 TWIPS = 1.27 cm)-->

  <!--     * Boolean flag: 1 to use default footer (page number and date) or 0 no footer -->
  <xsl:param name="use-default-footer" select="1" /> <!-- Use default footer if not is specified in HTML document -->

  <!--   ==================================================== -->
  <!--   MISCELLANEOUS -->
  <!--   ==================================================== -->

  <!--     * Boolean flag: 1 protected (cannot be modified) or 0 unprotected -->
  <xsl:param name="document-protected" select="1" /> <!-- document is protected  -->

  <!--     * Boolean flag: 1 spaces are normalized and trimmed, or 0 no normalization no trim -->
  <xsl:param name="normalize-space" select="0" /> <!-- no normalization -->

  <!--     * Boolean flag: 1 spaces are normalized (NOT TRIMMED), or 0 no normalization -->
  <xsl:param name="my-normalize-space" select="1" /> <!-- normalization (NO TRIM) -->

  <!--     * Gap between cells in tables, in TWIPS -->
  <xsl:param name="table-gap-between-cells" select="216" /> <!-- 216 TWIPS = 0,38 cm -->

  <!--     * Generate RTF Stylesheet (some RTF reader do not support this) -->
  <xsl:param name="no-rtf-stylesheet" select="0" /> <!-- 0 use stylesheet, 1 no stylesheet -->


  <!-- ***************************************************************************************************** -->
  <!-- ENTRY POINT - RECURSE -->
  <!-- ***************************************************************************************************** -->
  <xsl:template match="/">
    <xsl:apply-templates />
  </xsl:template>

  <!-- ***************************************************************************************************** -->
  <!-- XHTML STANDARD TAGS -->
  <!-- ***************************************************************************************************** -->

  <!--   ==================================================== -->
  <!--   The GLOBAL STRUCTURE of an HTML document -->
  <!--   ==================================================== -->

  <!--     * The HTML element http://www.w3.org/TR/html4/struct/global.html#h-7.3 -->
  <xsl:template match="xhtml:html">
    {\rtf1\ansi\ansicpg1252\deff0\deflang1033
{\fonttbl
{\f0\fswiss\fcharset0
    <xsl:value-of select="$font-name-default" />
    }
{\f1\fswiss\fcharset0
    <xsl:value-of select="$font-name-fixed" />
    }
{\f2\fswiss\fcharset0
    <xsl:value-of select="$font-name-barcode" />
    }
{\f3\fnil\fcharset2 Symbol;}
}
    <xsl:if test="xhtml:head">
      {\info
      <xsl:apply-templates select="xhtml:head/xhtml:title" />
      <xsl:apply-templates select="xhtml:head/xhtml:base" />
      <xsl:apply-templates select="xhtml:head/xhtml:meta" />
      }
    </xsl:if>
    {\colortbl;\red0\green0\blue0;\red0\green0\blue255;\red0\green255\blue0;\red255\green0\blue0;\red255\green255\blue255}
    <xsl:if test="$no-rtf-stylesheet = '0'">{\stylesheet
{{\*\cs1 \additive\ul\cf2 Hyperlink;}}
}
</xsl:if>
    <xsl:apply-templates />
    }
  </xsl:template>

  <!--     * The document head http://www.w3.org/TR/html4/struct/global.html#h-7.4 -->

  <!--       * The HEAD element http://www.w3.org/TR/html4/struct/global.html#h-7.4.1 -->
  <xsl:template match="xhtml:head">
    <xsl:apply-templates />
  </xsl:template>

  <!--       * The TITLE element http://www.w3.org/TR/html4/struct/global.html#h-7.4.2 -->
  <xsl:template match="xhtml:title">
    {\title
    <xsl:value-of select="." />
    }
  </xsl:template>

  <!--       * TODO fix: The title attribute http://www.w3.org/TR/html4/struct/global.html#h-7.4.3 -->
  <xsl:template match="xhtml:*[@title]">
    {\*\atrfstart 45511431}
    <xsl:apply-templates />
    {\*\atrfend 45511431}
{\*\atnid 1}{\*\atnauthor X}\chatn {\*\annotation {\*\atnref 45512050 {\*\atndate 1719093957}{
    <xsl:value-of select="@title" />
    }}}
  </xsl:template>

  <!--       * Meta data http://www.w3.org/TR/html4/struct/global.html#h-7.4.4 -->

  <!--         * The meta element http://www.w3.org/TR/html4/struct/global.html#h-7.4.4.2 -->

  <!--           * Meta data: Keywords -->
  <xsl:template match="xhtml:meta[@name = 'keywords']">
    {\keywords
    <xsl:value-of select="@content" />
    }
  </xsl:template>
  <!--           * Meta data: Author -->
  <xsl:template match="xhtml:meta[@name = 'author']">
    {\author
    <xsl:value-of select="@content" />
    }
  </xsl:template>
  <!--           * NEW Meta data: Subject (unknown in HTML, but available in RTF) -->
  <xsl:template match="xhtml:meta[@name = 'subject']">
    {\subject
    <xsl:value-of select="@content" />
    }
  </xsl:template>
  <!--           * NEW Meta data: Manager (unknown in HTML, but available in RTF) -->
  <xsl:template match="xhtml:meta[@name = 'manager']">
    {\subject
    <xsl:value-of select="@content" />
    }
  </xsl:template>
  <!--           * NEW Meta data: Category (unknown in HTML, but available in RTF) -->
  <xsl:template match="xhtml:meta[@name = 'category']">
    {\subject
    <xsl:value-of select="@content" />
    }
  </xsl:template>
  <!--           * NEW Meta data: Comment (unknown in HTML, but available in RTF) -->
  <xsl:template match="xhtml:meta[@name = 'comment']">
    {\subject
    <xsl:value-of select="@content" />
    }
  </xsl:template>
  <!--           * TODO: handle other well-know HTML meta data (http-equiv?) -->

  <!--     * The document body http://www.w3.org/TR/html4/struct/global.html#h-7.5 -->

  <!--       * The BODY element http://www.w3.org/TR/html4/struct/global.html#h-7.5.1 -->
  <xsl:template match="xhtml:body">
    <!-- Add margins into body (based on variables), set default font size (based on variable)
     Add form protection (\formprot) into document if flag is ON
     Insert footer definition if flag is ON (centered, font size based on variable, page number/total and date)
     Insert header definition if there is a <head/title> tag -->
    <xsl:if test="$document-protected = '1'">\formprot</xsl:if>
    \margl
    <xsl:value-of select="round($page-setup-margin-left)" />
    \margr
    <xsl:value-of select="round($page-setup-margin-right)" />
    \margt
    <xsl:value-of select="round($page-setup-margin-top)" />
    \margb
    <xsl:value-of select="round($page-setup-margin-bottom)" />
    \paperw
    <xsl:value-of select="round($page-setup-paper-width)" />
    \paperh
    <xsl:value-of select="round($page-setup-paper-height)" />
    \pgnstart
    <xsl:value-of select="$page-start-number" />
    <xsl:if test="$use-default-footer = '1'">
      {\footer\pard\fs
      <xsl:value-of select="round($footer-font-size-default)" />
      \qc Page\~{\field{\*\fldinst PAGE}}/{\field{\*\fldinst NUMPAGES}}\~-\~{\field{\*\fldinst DATE \\@ "dd/MM/yyyy" }}\~-\~{\field{\*\fldinst TIME \\@ "hh:mm:ss" }}\par }
    </xsl:if>
    <xsl:if test="/xhtml:html/xhtml:head/xhtml:title and count(//xhtml:*[@class = 'rtf_header'])=0 and count(//xhtml:*[@class = 'rtf_header_first'])=0">
      {\header\fs
      <xsl:value-of select="round($header-font-size-default)" />
      <xsl:value-of select="/xhtml:html/xhtml:head/xhtml:title" />
      }
    </xsl:if>
    <xsl:if test="//xhtml:*[@class = 'rtf_header_first']">\titlepg </xsl:if>
    \headery
    <xsl:value-of select="round($header-distance-from-edge)" />
    \footery
    <xsl:value-of select="round($footer-distance-from-edge)" />
    {\fs
    <xsl:value-of select="round($font-size-default)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="0" />
    </xsl:apply-templates>
    }
  </xsl:template>

  <!--         * Grouping elements: the DIV and SPAN elements http://www.w3.org/TR/html4/struct/global.html#h-7.5.4 -->
  <xsl:template match="xhtml:div">
    <xsl:param name="preformatted" select="0" />
    \pard \sa60
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    \par
  </xsl:template>
  <xsl:template match="xhtml:span">
    <xsl:param name="preformatted" select="0" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
  </xsl:template>

  <!--         * Headings: The H1, H2, H3, H4, H5, H6 elements http://www.w3.org/TR/html4/struct/global.html#h-7.5.5 -->
  <xsl:template match="xhtml:h1">
    <xsl:param name="preformatted" select="0" />
    \sb120\sa120 {\b\fs
    <xsl:value-of select="round($font-size-default*2.0)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>
  <xsl:template match="xhtml:h2">
    <xsl:param name="preformatted" select="0" />
    \sb120\sa120 {\b\fs
    <xsl:value-of select="round($font-size-default*1.5)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>
  <xsl:template match="xhtml:h3">
    <xsl:param name="preformatted" select="0" />
    \sb120\sa120 {\b\fs
    <xsl:value-of select="round($font-size-default*1.1)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>
  <xsl:template match="xhtml:h4">
    <xsl:param name="preformatted" select="0" />
    \sb120\sa120 {\b\fs
    <xsl:value-of select="round($font-size-default*1.0)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>
  <xsl:template match="xhtml:h5">
    <xsl:param name="preformatted" select="0" />
    \sb120\sa120 {\b\fs
    <xsl:value-of select="round($font-size-default*0.8)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>
  <xsl:template match="xhtml:h6">
    <xsl:param name="preformatted" select="0" />
    \sb120\sa120 {\b\fs
    <xsl:value-of select="round($font-size-default*0.6)" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>

  <!--         * The ADDRESS element http://www.w3.org/TR/html4/struct/global.html#h-7.5.6 -->
  <xsl:template match="xhtml:address">
    <xsl:param name="preformatted" select="0" />
    \pard {\i
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    } \par
  </xsl:template>


  <!--   ==================================================== -->
  <!--   Text - Paragraphs, Lines, and Phrases http://www.w3.org/TR/html4/struct/text.html -->
  <!--   ==================================================== -->

  <!--   * Structured text -->

  <!--     * Phrase elements: EM, STRONG, DFN, CODE, SAMP, KBD, VAR, CITE, ABBR, and ACRONYM http://www.w3.org/TR/html4/struct/text.html#h-9.2.1 -->
  <!--       * The EM element -->
  <xsl:template match="xhtml:em">
    <xsl:param name="preformatted" select="0" />
    {\i
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The STRONG element -->
  <xsl:template match="xhtml:strong">
    <xsl:param name="preformatted" select="0" />
    {\b
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The DFN element -->
  <xsl:template match="xhtml:dfn">
    <xsl:param name="preformatted" select="0" />
    {\i
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The CODE element (use font number 1: the fixed-width font, usually courier new) -->
  <xsl:template match="xhtml:code">
    <xsl:param name="preformatted" select="0" />
    {\f1
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The SAMP element (same as CODE above) -->
  <xsl:template match="xhtml:samp">
    <xsl:param name="preformatted" select="0" />
    {\f1
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The KBD element (same as CODE above) -->
  <xsl:template match="xhtml:kbd">
    <xsl:param name="preformatted" select="0" />
    {\f1
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The VAR element -->
  <xsl:template match="xhtml:var">
    <xsl:param name="preformatted" select="0" />
    {\i
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The CITE element -->
  <xsl:template match="xhtml:cite">
    <xsl:param name="preformatted" select="0" />
    {\i
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The ABBR element (normal - no font or style change) -->
  <xsl:template match="xhtml:abbr">
    <xsl:param name="preformatted" select="0" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
  </xsl:template>
  <!--       * The ACRONYM element (normal - no font or style change) -->
  <xsl:template match="xhtml:acronym">
    <xsl:param name="preformatted" select="0" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
  </xsl:template>

  <!--     * Quotations: The BLOCKQUOTE and Q elements http://www.w3.org/TR/html4/struct/text.html#h-9.2.2 -->
  <xsl:template match="xhtml:blockquote">
    <xsl:param name="preformatted" select="0" />
    {\li800
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <!--       * The Q element (normal - no font or style change) -->
  <xsl:template match="xhtml:q">
    <xsl:param name="preformatted" select="0" />
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
  </xsl:template>

  <!--   * Lines and Paragraphs http://www.w3.org/TR/html4/struct/text.html#h-9.3 -->

  <!--     * Paragraphs: the P element http://www.w3.org/TR/html4/struct/text.html#h-9.3.1 -->
  <xsl:template match="xhtml:p">
    <xsl:param name="preformatted" select="0" />
    <xsl:choose>
      <!-- when a paragraph follows a paragraph, add up some space between the two (space after: \saX, space before: \sbX) -->
      <xsl:when test="name(following-sibling::node()[position() = 1]) = 'p'">
        \pard
        <xsl:call-template name="attribute_align" />
        \sb100\sa100 {
        <xsl:apply-templates>
          <xsl:with-param name="preformatted" select="$preformatted" />
        </xsl:apply-templates>
        }\par \pard
      </xsl:when>
      <xsl:otherwise>
        <xsl:call-template name="attribute_align" />
        <xsl:apply-templates>
          <xsl:with-param name="preformatted" select="$preformatted" />
        </xsl:apply-templates>
        \par \pard
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!--       TODO: handle Paragraph attributes WITHIN the p template (avoid copy/paste of paragraph processing) -->
  <xsl:template match="xhtml:p[@style = 'page-break-after:always']">
    <xsl:param name="preformatted" select="0" />
    \pard
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    \par
    <xsl:call-template name="page_break" />
  </xsl:template>
  <xsl:template match="xhtml:p[@style = 'page-break-before:always']">
    <xsl:param name="preformatted" select="0" />
    <xsl:call-template name="page_break" />
    \pard
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    \par
  </xsl:template>
  <!--       TODO handle all left margins values for Paragraphs -->
  <xsl:template match="xhtml:p[@style = 'margin-left:1cm']">
    <xsl:param name="preformatted" select="0" />
    \pard \li567
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    \par
  </xsl:template>
  <xsl:template match="xhtml:p[@style = 'margin-left:2cm']">
    <xsl:param name="preformatted" select="0" />
    \pard \li1134
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    \par
  </xsl:template>
  <!--       TODO handle all right margins for Paragraphs -->

  <!--     * Controlling line breaks http://www.w3.org/TR/html4/struct/text.html#h-9.3.2 -->

  <!--       * Forcing a line break: the BR element -->
  <xsl:template match="xhtml:br">
    <xsl:choose>
      <xsl:when test="name(following-sibling::node()[position() = 1]) = 'p' or name(following-sibling::node()[position() = 1]) = 'center'">\par </xsl:when>
      <xsl:otherwise>\line </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!--       * Prohibiting a line break (non-breaking space)-->
  <!--         replace non-breaking spaces (&#160;) by \~ (see default template for "text()" node below) -->

  <!--     * Hyphenation (TODO: handle hyphen and soft hyphen characters) http://www.w3.org/TR/html4/struct/text.html#h-9.3.3 -->

  <!--     * Preformatted text: The PRE element http://www.w3.org/TR/html4/struct/text.html#h-9.3.4 -->
  <!--       Set parameter "preformatted" to 1 - all sub-templates should pass along this parameter so that the final text is preformatted -->
  <xsl:template match="xhtml:pre">
    {\f1
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="1" />
    </xsl:apply-templates>
    }\line \par
  </xsl:template>

  <!--   * INS and DEL elements: TODO implement them (?) http://www.w3.org/TR/html4/struct/text.html#h-9.4 -->

  <!-- * Lists - Unordered, Ordered, and Definition Lists http://www.w3.org/TR/html4/struct/lists.html -->

  <!--   * Unordered lists (UL), ordered lists (OL), and list items (LI) -->
  <!--     * Unordered lists (UL) TODO handle UL element -->
  <xsl:template match="xhtml:ul">
    \pard{\pntext\f3\'B7\tab}{\*\pn\pnlvlblt\pnf3\pnindent0{\pntxtb\'B7}}\fi-720\li720
    <xsl:apply-templates />
    \pard
  </xsl:template>
  <!--     * ordered lists (OL) TODO handle OL element -->
  <xsl:template match="xhtml:ol">
    <xsl:apply-templates />
  </xsl:template>
  <!--     * list items (LI) TODO handle LI element -->
  <xsl:template match="xhtml:li">
    {\pntext\f3\'B7\tab}
    <xsl:apply-templates />
    \par
  </xsl:template>

  <!--   * Definition lists: the DL, DT, and DD elements TODO handle definition lists http://www.w3.org/TR/html4/struct/lists.html#h-10.3 -->
  <xsl:template match="xhtml:dl">
    <xsl:apply-templates />
  </xsl:template>
  <xsl:template match="xhtml:dt">
    <xsl:apply-templates />
  </xsl:template>
  <xsl:template match="xhtml:dd">
    <xsl:apply-templates />
  </xsl:template>

  <!--   * The DIR and MENU elements TODO? handle DIR and MENU elements (deprecated) http://www.w3.org/TR/html4/struct/lists.html#h-10.4 -->

  <!-- * Tables http://www.w3.org/TR/html4/struct/tables.html -->

  <!--   * The TABLE element http://www.w3.org/TR/html4/struct/tables.html#h-11.2.1 -->
  <xsl:template match="xhtml:table" name="table">
    \par \pard
    <xsl:variable name="tableWidthVar">
      <xsl:choose>
        <xsl:when test="contains(@width, '%')">
          <xsl:value-of select="round(($page-setup-paper-width - 1.2*($page-setup-margin-left + $page-setup-margin-right)) * number(substring-before(@width,'%')) div 100.0)" />
        </xsl:when>
        <xsl:otherwise>0</xsl:otherwise>
      </xsl:choose>
    </xsl:variable>
    <xsl:variable name="temp" select="xhtml2rtf:TableCellWidthFill(., number($tableWidthVar))" />
    <xsl:apply-templates>
      <xsl:with-param name="tableWidth" select="number($tableWidthVar)" />
      <xsl:with-param name="tableBorder" select="@border" />
    </xsl:apply-templates>
    \par
    <xsl:value-of select="$temp" />
  </xsl:template>

  <!--   *  TODO Table Captions: The CAPTION element http://www.w3.org/TR/html4/struct/tables.html#h-11.2.2 -->
  <!--   *  TODO Row groups: the THEAD, TFOOT, and TBODY elements http://www.w3.org/TR/html4/struct/tables.html#h-11.2.3 -->
  <!--   *  TODO Column groups: the COLGROUP and COL elements http://www.w3.org/TR/html4/struct/tables.html#h-11.2.4 -->

  <!--   * The TR element http://www.w3.org/TR/html4/struct/tables.html#h-11.2.5 -->
  <!-- TODO fix bugs in RTF table generation (Error message on WordXP, crashes Word2000!!!) -->
  <xsl:template match="xhtml:tr" name="tr">
    <xsl:param name="tableWidth" />
    <xsl:param name="tableBorder" />
    {\trowd \trql\trgaph108\trrh280\trleft36
    <xsl:for-each select="xhtml:td">
      \clvertalc
      <xsl:if test="$tableBorder &gt; 0">
        \clbrdrt\brdrs\brdrw
        <xsl:value-of select="format-number($tableBorder*15,'#')" />
        \clbrdrl\brdrs\brdrw
        <xsl:value-of select="format-number($tableBorder*15,'#')" />
        \clbrdrb\brdrs\brdrw
        <xsl:value-of select="format-number($tableBorder*15,'#')" />
        \clbrdrr\brdrs\brdrw
        <xsl:value-of select="format-number($tableBorder*15,'#')" />
      </xsl:if>
      \cellx
      <xsl:value-of select="format-number(xhtml2rtf:GetTableColumnWidth(position(), 2, $font-size-default), '#')" />
      \clwWidth
      <xsl:value-of select="format-number(xhtml2rtf:GetTableColumnWidth(position(), 0, $font-size-default), '#')" />
    </xsl:for-each>
    {\intbl \ql
    <xsl:apply-templates />
    }
  \pard\intbl\row }
  </xsl:template>

  <!--   * The TD element http://www.w3.org/TR/html4/struct/tables.html#h-11.2.6 -->
  <!-- TODO fix bugs in RTF table generation (Error message on WordXP, crashes Word2000!!!) -->
  <!-- <xsl:template match="xhtml:td" name="td">\~<xsl:apply-templates/></xsl:template> -->
  <xsl:template match="xhtml:td" name="td">
    <xsl:apply-templates />
    \cell
  </xsl:template>

  <!--   * The TH element http://www.w3.org/TR/html4/struct/tables.html#h-11.2.6 -->
  <xsl:template match="xhtml:th" name="th">
    {\intbl \li57\ri57 {\b
    <xsl:apply-templates />
    }\cell }
  </xsl:template>

  <!--     Known classes, attributes and styles for table, row and cells -->
  <xsl:template match="xhtml:table[@class = 'rtf_header']">
    <xsl:call-template name="header" />
  </xsl:template>
  <xsl:template match="xhtml:table[@class = 'rtf_header_first']">
    <xsl:call-template name="header_first" />
  </xsl:template>
  <xsl:template name="header">
    {\header\fs
    <xsl:value-of select="round($header-font-size-default)" />
    \pard
\li
    <xsl:value-of select="round($header-indentation-left)" />
    <xsl:call-template name="table" />
    \par }
  </xsl:template>
  <xsl:template name="header_first">
    {\headerf\fs
    <xsl:value-of select="round($header-font-size-default)" />
    \pard
\li
    <xsl:value-of select="round($header-indentation-left)" />
    <xsl:call-template name="table" />
    \par }
  </xsl:template>
  <xsl:template match="xhtml:td[@align = 'right']">
    {\qr
    <xsl:call-template name="td" />
    }
  </xsl:template>
  <xsl:template match="xhtml:td[@align = 'left']">
    {\ql
    <xsl:call-template name="td" />
    }
  </xsl:template>
  <xsl:template match="xhtml:td[@align = 'center']">
    {\qc
    <xsl:call-template name="td" />
    }
  </xsl:template>

  <!-- * Links - Hypertext and Media-Independent Links -->
  <!--   * The A element -->
  <xsl:template match="xhtml:a">
    <!-- TODO support BOTH attributes name and href for same anchor -->
    <xsl:choose>
      <!-- When there's a name attribute, we create a bookmark with the given name -->
      <xsl:when test="@name">
        {\bkmkstart
        <xsl:value-of select="@name" />
        }
        <xsl:apply-templates />
        {\bkmkend
        <xsl:value-of select="@name" />
        }
      </xsl:when>
      <!-- When there's an href attribute, we create a field "hyperlink" to the given href -->
      <xsl:otherwise>
        <xsl:choose>
          <!-- Stylesheet allowed: build Word hyperlinks (cs1) -->
          <xsl:when test="$no-rtf-stylesheet = '0'">
            {\field{\*\fldinst {\cs1\ul\cf2 HYPERLINK "
            <xsl:value-of select="@href" />
            "}}{\fldrslt {\cs1\ul\cf2
            <xsl:apply-templates />
            }}}
          </xsl:when>
          <!-- No styleshet allowed: display plain text -->
          <xsl:otherwise>
            <xsl:apply-templates />
          </xsl:otherwise>
        </xsl:choose>
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>
  <!--   * The LINK element (ignore it) -->
  <xsl:template match="xhtml:link"></xsl:template>
  <!--   * The BASE element http://www.w3.org/TR/html4/struct/links.html#h-12.4 -->
  <xsl:template match="xhtml:base">
    {\hlinkbase
    <xsl:value-of select="@href" />
    }
  </xsl:template>

  <!-- * TODO Objects, Images, and Applets http://www.w3.org/TR/html4/struct/objects.html -->

  <!-- * TODO Style Sheets - Adding style to HTML documents http://www.w3.org/TR/html4/present/styles.html -->
  <!--   * The STYLE element (ignore it) http://www.w3.org/TR/html4/present/styles.html#h-14.2.3 -->
  <xsl:template match="xhtml:style"></xsl:template>

  <!-- * Alignment, font styles, and horizontal rules http://www.w3.org/TR/html4/present/graphics.html -->
  <!--   * Formatting http://www.w3.org/TR/html4/present/graphics.html#h-15.1 -->
  <!--     * Background color -->
  <!--     * Alignment -->
  <!--     * Floating objects -->
  <!--       * Float an object -->
  <!--       * Float text around an object -->

  <!--   * Fonts http://www.w3.org/TR/html4/present/graphics.html#h-15.2 -->

  <!--     * Font style elements: the TT, I, B, BIG, SMALL, STRIKE, S, and U elements http://www.w3.org/TR/html4/present/graphics.html#h-15.2.1 -->
  <xsl:template match="xhtml:b">
    <xsl:param name="preformatted" select="0" />
    {\b
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <xsl:template match="xhtml:i">
    <xsl:param name="preformatted" select="0" />
    {\i
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>
  <xsl:template match="xhtml:u">
    <xsl:param name="preformatted" select="0" />
    {\ul
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }
  </xsl:template>

  <!--     * Font modifier elements: FONT and BASEFONT http://www.w3.org/TR/html4/present/graphics.html#h-15.2.2 -->
  <xsl:template match="xhtml:font">
    <xsl:param name="preformatted" select="0" />
    <!-- TODO: enhance font processing: color attributes -->
    <xsl:choose>
      <xsl:when test="@face=$font-name-barcode">
        {\f2
        <xsl:call-template name="attribute_font_size" />
        <xsl:apply-templates />
        }
      </xsl:when>
      <xsl:otherwise>
        {
        <xsl:call-template name="attribute_font_size" />
        <xsl:apply-templates>
          <xsl:with-param name="preformatted" select="$preformatted" />
        </xsl:apply-templates>
        }
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!--       * FONT SIZE: use special attribute xhtml2rtf:size (and not "size" because it has a very different meaning in HTML) -->
  <!--         * in HTML, size value is an integer between 1 and 7 (1=xx-small, 2=x-small, 3=small, 4=medium, 5=large, 6=x-large, 7=xx-large) -->
  <!--         TODO: create 7 RTF font sizes based on default font size -->
  <!--         * in RTF, size value is an half the number of POINTS (\fs24 = font size 12pt) -->
  <xsl:template name="attribute_font_size">
    <xsl:if test="@xhtml2rtf:size">
      \fs
      <xsl:value-of select="round(@xhtml2rtf:size*2)" />
    </xsl:if>
  </xsl:template>

  <!--   * Rules: the HR element -->
  <!--     TODO handle attributes (even if they are deprecated!): align (left, right, center), size (pixels), width (pixels or %) -->
  <xsl:template match="xhtml:hr">\pard \brdrb \brdrs\brdrw10\brsp20 {\fs4\~}\par \pard </xsl:template>

  <!-- * TODO Frames - Multi-view presentation of documents http://www.w3.org/TR/html4/present/frames.html -->

  <!-- * TODO Forms - User-input Forms: Text Fields, Buttons, Menus, and more http://www.w3.org/TR/html4/interact/forms.html -->

  <!-- * TODO Scripts - Animated Documents and Smart Forms -->
  <!--   * The SCRIPT element (ignore it) -->
  <xsl:template match="xhtml:script"></xsl:template>


  <!-- Attributes -->
  <xsl:template match="xhtml:center">
    <xsl:param name="preformatted" select="0" />
    {\qc
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    \par }\pard
  </xsl:template>
  <xsl:template name="attribute_align">
    <xsl:choose>
      <xsl:when test="@align = 'center'">\qc </xsl:when>
      <xsl:when test="@align = 'left'">\ql </xsl:when>
      <xsl:when test="@align = 'right'">\qr </xsl:when>
      <xsl:otherwise>\ql </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- Page break -->
  <xsl:template name="page_break">\page </xsl:template>

  <!-- Default Template -->
  <xsl:template match="text()">
    <xsl:param name="preformatted" select="0" />
    <xsl:choose>
      <xsl:when test="$preformatted = '1'">
        <xsl:value-of select="xhtml2rtf:RTFEncode(., string(.), 2)" />
      </xsl:when>
      <xsl:when test="$normalize-space = '1'">
        <xsl:value-of select="xhtml2rtf:RTFEncode(., string(normalize-space(.)))" />
      </xsl:when>
      <xsl:otherwise>
        <xsl:value-of select="xhtml2rtf:RTFEncode(., string(.), $my-normalize-space)" />
      </xsl:otherwise>
    </xsl:choose>
  </xsl:template>

  <!-- JavaScript use to ENCODE special characters (backslash, left curly bracket, right curly bracket, etc...) -->
  <msxsl:script language="JavaScript" implements-prefix="xhtml2rtf">
  function CharCode(strText)
  {
    var strCharCodes = "###";
    var strSeparator = "";
    for (var intChar = 0; intChar &lt; strText.length; intChar++)
    {
      strCharCodes += strText.charCodeAt(intChar).toString() + strSeparator;
      strSeparator = ","
    }
    strCharCodes += "###";
    return(strCharCodes);
  }
  function RTFEncode(objXMLNodes, strText, intMyNormalizeSpaces)
  {
    // Encode text, character by character

    if (intMyNormalizeSpaces == 1)
    {
      // Replace multiple spaces by one single space
      strText = strText.replace(/ +/g, " ");
    }

    var blnAppendParagraphBreak = false;

    // Build an array of characters
    var arrChars = strText.split("");
    for (var intChar = 0; intChar &lt; arrChars.length; intChar++)
    {
      var strChar = arrChars[intChar];
      switch (strChar.valueOf())
      {
        case "\\":
        case "{":
        case "}":
          // Encode backslashes, left curly bracket, right curly bracket (prefix with a backslash)
          arrChars[intChar] = "\\" + strChar;
          break;

        case "&#160;":
          // Encode non-breacking space (backslash+tilda)
          arrChars[intChar] = "\\~";
          break;

        case "\n":
          if (intMyNormalizeSpaces == 2)
          {
            // Preformatted mode - use \line for all EOL characters
            arrChars[intChar] = "\\line ";
            // Check if next node is a paragraph - if yes, we will use a paragraph break INSTEAD of line break
            if (objXMLNodes != null &amp;&amp; objXMLNodes.length != 0)
            {
              var objXMLContext = objXMLNodes[0];
              var objNextNode = objXMLContext.selectSingleNode("following-sibling::node()[position() = 1]");
              if (objNextNode != null)
              {
                if (objNextNode.nodeName == "p")
                {
                  blnAppendParagraphBreak = true;
                }
              }
            }
          }
          break;

        default:
          var intCharCode = strChar.charCodeAt(0);
          if (intCharCode &gt; 255)
          {
            // Non-ascii: encode as UNICODE (\u)
            arrChars[intChar] = "\\u" + intCharCode.toString() + "  ";
          }
          else
          {
            // TODO Handle control characters (ASCII code lesser than 32 - TAB, EOL, etc...)
            // No encoding
          }
          break;

      }
    }

    // Convert back array to string
    var strRTFEncoded = arrChars.join("");

    if (blnAppendParagraphBreak)
    {
      // Append a paragraph break - next node is a p tag, but we are not inside a p tag (bad!)
      strRTFEncoded += "\\par ";
    }

    return(strRTFEncoded);
  }

  var multiplyWidth = 192;
  var marginWidth = 196;
  var arrMaxLen;
  var arrTotLen;
  function TableCellWidthFill(objXMLNodes, tableWidth)
  {
	  var strText = "";
	  if (objXMLNodes != null &amp;&amp; objXMLNodes.length != 0)
	  {
		  var objRowNodes = objXMLNodes[0].selectNodes("./*");
		  var objRowNode;
		  var objColNodes;
		  arrMaxLen = new Array();
		  arrTotLen = new Array();
		  var maxWordLen;
		  for(var i = 0; i &lt; objRowNodes.length; i++ )
		  {
			  objRowNode = objRowNodes[i];
			  objColNodes = objRowNode.selectNodes("./*");
			  for(var j = 0; j &lt; objColNodes.length; j++ )
			  {
				  var arrWords = objColNodes[j].text.split(/[\s+]/);
				  maxWordLen = 0;
				  arrTotLen[j] = objColNodes[j].text.length;
				  for(var iWord = 0; iWord &lt; arrWords.length; iWord++)
				  {
					  if(arrWords[iWord].length > maxWordLen )
					  {
						  maxWordLen = arrWords[iWord].length;
					  }
				  }
				  arrMaxLen[j] = arrMaxLen[j] &gt; maxWordLen ? arrMaxLen[j] : (maxWordLen+1);
			  }
		  }
		  if( tableWidth &gt; 0 )
		  {
			  var totalWidthTot = 0;
			  var totalWidthMax = 0;

			  for(var i = 0; i &lt; arrMaxLen.length; i++ )
			  {
				  totalWidthTot += (arrTotLen[i]*multiplyWidth + 2*marginWidth);
				  totalWidthMax += (arrMaxLen[i]*multiplyWidth + 2*marginWidth);
			  }

			  var tableWidthTot = tableWidth;
			  var tableWidthMax = tableWidth;
			  var midWidthTot = tableWidth / arrTotLen.length;
			  var midWidthMax = tableWidth / arrMaxLen.length;
			  var midAddTot = (tableWidth - totalWidthTot) / arrTotLen.length;
			  var midAddMax = (tableWidth - totalWidthMax) / arrMaxLen.length;

			  //strText += "totalWidthTot = " + totalWidthTot.toString() + " \n";
			  //strText += "totalWidthMax = " + totalWidthMax.toString() + " \n";
			  //strText += "midAddTot = " + midAddTot.toString() + " \n";
			  //strText += "midAddMax = " + midAddMax.toString() + " \n";
			  for(var i = 0; i &lt; arrMaxLen.length; i++ )
			  {
				  arrMaxLen[i] = (arrMaxLen[i]*multiplyWidth + 2*marginWidth)*tableWidth/totalWidthTot/multiplyWidth;
			  }
		  }
	  }
	  return(strText);
  }
  function GetTableColumnWidth(iColumn, bSum, font_size)
  {
	  multiplyWidth = font_size*8;
	  var sum = 0;
	  iColumn = iColumn-1;
	  if( iColumn &lt; arrMaxLen.length &amp;&amp; iColumn &gt;= 0 )
	  {
		  if( bSum == 0 )
		  {
			  return(2*marginWidth +  arrMaxLen[iColumn]*multiplyWidth);
		  }
		  else if( bSum == 1 )
		  {
			  return(2*marginWidth +  arrTotLen[iColumn]*multiplyWidth);
		  }
		  else if( bSum == 2 )
		  {
			  for(var i = 0; i &lt;= iColumn; i++ )
			  {
				  sum += (2*marginWidth + arrMaxLen[i]*multiplyWidth);
			  }
			  return(sum);
		  }
		  else if( bSum == 3 )
		  {
			  for(var i = 0; i &lt;= iColumn; i++ )
			  {
				  sum += (2*marginWidth + arrTotLen[i]*multiplyWidth);
			  }
			  return(sum);
		  }
	  }
	  return 0;
  }
</msxsl:script>

  <!-- ***************************************************************************************************** -->
  <!-- CUSTOM TAGS (styles, classes, etc...) -->
  <!-- ***************************************************************************************************** -->

  <!--   ==================================================== -->
  <!--   RTF direct access -->
  <!--   ==================================================== -->

  <!--   * Page numbers -->
  <xsl:template match="xhtml2rtf:page_number">{\field{\*\fldinst PAGE}}</xsl:template>
  <xsl:template match="xhtml2rtf:total_number_of_pages">{\field{\*\fldinst NUMPAGES}}</xsl:template>

  <!--   * Any RAW RTF command-->
  <xsl:template match="xhtml2rtf:raw">
    <xsl:value-of select="." />
  </xsl:template>

  <!--   ==================================================== -->
  <!--   HTML Custom tags -->
  <!--   ==================================================== -->

  <!-- Ignore "titre" class -->
  <xsl:template match="xhtml:td[@class = 'titre']"></xsl:template>

  <!-- Ignore "login" class -->
  <xsl:template match="xhtml:td[@class = 'login']"></xsl:template>

  <!-- Ignore "menu" class -->
  <xsl:template match="xhtml:th[@class = 'menu']"></xsl:template>

  <!-- Ignore "noprint" class on any tag -->
  <xsl:template match="xhtml:*[@class = 'noprint']"></xsl:template>

  <!-- div title have space before (\sb) and space after (\sa) tags, and a font size (\fs) of 125% (10pt=>12.5pt=25) -->
  <xsl:template match="xhtml:div[@class = 'title']">
    <xsl:param name="preformatted" select="0" />
    \pard \sb120\sa120 {\fs25
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>

  <!-- subtitle have bold face and a font size (\fs) of 110% (10pt=>11pt=22) -->
  <xsl:template match="xhtml:p[@class = 'title']">
    <xsl:param name="preformatted" select="0" />
    \pard \sb100\sa100 {\b\fs22
    <xsl:apply-templates>
      <xsl:with-param name="preformatted" select="$preformatted" />
    </xsl:apply-templates>
    }\par
  </xsl:template>

  <xsl:template match="xhtml:p[@class = 'rtf_header']">
    <xsl:call-template name="header" />
  </xsl:template>
  <xsl:template match="xhtml:p[@class = 'rtf_header_first']">
    <xsl:call-template name="header_first" />
  </xsl:template>

</xsl:stylesheet>
