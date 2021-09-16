export class Lexer {
  pos: number;
  private buffer: Token | null;

  constructor(public source: string) {
    this.pos = 0;
    this.buffer = null;
  }

  pop(): Token {
    if (this.buffer) {
      const next = this.buffer;
      this.buffer = null;
      return next;
    } else {
      return this.next();
    }
  }

  peek(): Token {
    if (!this.buffer) {
      this.buffer = this.next();
    }
    return this.buffer;
  }

  private next(): Token {
    if (this.pos >= this.source.length) {
      return new Token(TokenKind.Eof, '');
    }

    const start = this.pos;
    const c = this.source[this.pos++];

    let kind: TokenKind;
    if (c === '(') {
      kind = TokenKind.LParen;
    } else if (c === ')') {
      kind = TokenKind.RParen;
    } else if (c === '[') {
      kind = TokenKind.LBracket;
    } else if (c === ']') {
      kind = TokenKind.RBracket;
    } else if (c === "'") {
      kind = TokenKind.Quote;
    } else if (c === '`') {
      kind = TokenKind.Backtick;
    } else if (c === ',') {
      if (this.source[this.pos] === '@') {
        this.pos += 1;
        kind = TokenKind.CommaAt;
      } else {
        kind = TokenKind.Comma;
      }
    } else if (
      isDigit(c) ||
      (c === '-' &&
        (this.source[this.pos] === '.' || isDigit(this.source[this.pos]))) ||
      (c === '.' && isDigit(this.source[this.pos]))
    ) {
      const seenDecimalPt = c === '.';
      // Regardless of whether c is '-', '.', or a digit, the current char is a digit.
      this.skipWhile(isDigit);

      if (!seenDecimalPt && this.source[this.pos] === '.') {
        this.pos++;
      }
      this.skipWhile(isDigit);

      kind = TokenKind.Number;
    } else if (c === '.') {
      if (this.source.slice(this.pos).startsWith('..')) {
        this.pos += 2;
        kind = TokenKind.Ellipsis;
      } else if (this.source.slice(this.pos).startsWith('.1')) {
        this.pos += 2;
        kind = TokenKind.Ellipsis1;
      } else {
        kind = TokenKind.Dot;
      }
    } else if (c === '#') {
      if ('tf'.includes(this.source[this.pos])) {
        this.pos += 1;
        kind = TokenKind.Boolean;
      } else {
        this.skipWhile(isUnknown);
        kind = TokenKind.Unknown;
      }
    } else if (startsSymbol(c)) {
      this.skipWhile(continuesSymbol);
      kind = TokenKind.Symbol;
    } else if (isWhitespace(c)) {
      this.skipWhile(isWhitespace);
      kind = TokenKind.Whitespace;
    } else if (c === ';') {
      this.skipWhile(c => !'\r\n'.includes(c));
      kind = TokenKind.LineComment;
    } else {
      this.skipWhile(isUnknown);
      kind = TokenKind.Unknown;
    }

    const end = this.pos;
    const text = this.source.slice(start, end);
    return new Token(kind, text);
  }

  private skipWhile(test: (c: char) => boolean) {
    while (this.pos < this.source.length) {
      if (!test(this.source[this.pos])) {
        break;
      }

      this.pos++;
    }
  }
}

function isDigit(c: char): boolean {
  return '0' <= c && c <= '9';
}

function startsSymbol(c: char): boolean {
  return (
    ('a' <= c && c <= 'z') ||
    ('A' <= c && c <= 'Z') ||
    '!$%^&*-_=+:<>/?'.includes(c)
  );
}

function continuesSymbol(c: char): boolean {
  return startsSymbol(c) || isDigit(c);
}

function isWhitespace(c: char): boolean {
  return ' \t\r\n'.includes(c);
}

function isUnknown(c: char): boolean {
  return !'()[] \t\r\n;'.includes(c);
}

type char = string;

export class Token {
  constructor(public kind: TokenKind, public text: string) {}
}

export enum TokenKind {
  LParen = 'LParen',
  RParen = 'RParen',
  LBracket = 'LBracket',
  RBracket = 'RBracket',
  Dot = 'Dot',
  Ellipsis = 'Ellipsis',
  Ellipsis1 = 'Ellipsis1',
  Quote = 'Quote',
  Backtick = 'Backtick',
  Comma = 'Comma',
  CommaAt = 'CommaAt',
  Number = 'Number',
  Boolean = 'Boolean',
  Symbol = 'Symbol',
  Whitespace = 'Whitespace',
  LineComment = 'LineComment',
  Unknown = 'Unknown',
  Eof = 'Eof',
}
