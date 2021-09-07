export class Lexer {
  private buffer: Token | null = null;
  private pos = 0;

  constructor(private source: string) {}

  peek(): Token {
    if (!this.buffer) {
      this.buffer = this.next();
    }

    return this.buffer;
  }

  pop(): Token {
    if (!this.buffer) {
      return this.next();
    } else {
      const out = this.buffer;
      this.buffer = null;
      return out;
    }
  }

  private next(): Token {
    const start = this.pos;
    if (this.pos >= this.source.length) {
      return { kind: TokenKind.Eof, span: { start, end: start }, text: '' };
    }

    const c = this.source[this.pos++];
    let kind: TokenKind;
    if ("()[].'`".includes(c)) {
      kind = this.readSingle(c);
    } else if (c === ',') {
      kind = this.readComma();
    } else if (this.startsName(c)) {
      kind = this.readName();
    } else if (this.isDigit(c)) {
      kind = this.readNum();
    } else if (c === '#') {
      kind = this.readBoolean();
    } else if (c === ';') {
      kind = this.readComment();
    } else if (this.isWhitespace(c)) {
      kind = this.readWhitespace();
    } else {
      kind = this.readUnknown();
    }

    const end = this.pos;
    const text = this.source.slice(start, end);
    return { kind, span: { start, end }, text };
  }

  private readSingle(char: string): TokenKind {
    return {
      '(': TokenKind.LParen,
      ')': TokenKind.RParen,
      '[': TokenKind.LBracket,
      ']': TokenKind.RBracket,
      '.': TokenKind.Dot,
      "'": TokenKind.Quote,
      '`': TokenKind.Backtick,
    }[char] as TokenKind;
  }

  private readComma(): TokenKind {
    if (this.source[this.pos] === '@') {
      this.pos++;
      return TokenKind.CommaAt;
    } else {
      return TokenKind.Comma;
    }
  }

  private startsName(c: string): boolean {
    return (
      ('a' <= c && c <= 'z') ||
      ('A' <= c && c <= 'Z') ||
      '!$%^&*-_=+:<>/?'.includes(c)
    );
  }

  private continuesName(c: string): boolean {
    return this.startsName(c) || this.isDigit(c);
  }

  private readName(): TokenKind {
    this.readWhile(this.continuesName.bind(this));
    return TokenKind.Name;
  }

  private isDigit(c: string): boolean {
    return '0' <= c && c <= '9';
  }

  private readNum(): TokenKind {
    this.readWhile(this.isDigit.bind(this));
    return TokenKind.Num;
  }

  private readBoolean(): TokenKind {
    const c = this.source[this.pos];
    if (c === 't' || c === 'f') {
      this.pos++;
      return TokenKind.Boolean;
    } else {
      return this.readUnknown();
    }
  }

  private readComment(): TokenKind {
    this.readWhile(c => !'\n\r'.includes(c));
    return TokenKind.Comment;
  }

  private isWhitespace(c: string): boolean {
    return ' \t\n\r'.includes(c);
  }

  private readWhitespace(): TokenKind {
    this.readWhile(this.isWhitespace.bind(this));
    return TokenKind.Whitespace;
  }

  private readUnknown(): TokenKind {
    this.readWhile(this.isUnknown.bind(this));
    return TokenKind.Unknown;
  }

  private isUnknown(c: string): boolean {
    return (
      !this.isDigit(c) &&
      !this.startsName(c) &&
      !this.isWhitespace(c) &&
      !"[]().',;#".includes(c)
    );
  }

  private readWhile(pred: (c: string) => boolean) {
    while (true) {
      // `this.pos` has already been incremented
      const c = this.source[this.pos];
      if (!c || !pred(c)) {
        break;
      }

      this.pos++;
    }
  }
}

export interface Token {
  kind: TokenKind;
  span: Span;
  text: string;
}

export interface Span {
  start: number;
  end: number;
}

export enum TokenKind {
  LParen = 'LParen',
  RParen = 'RParen',
  LBracket = 'LBracket',
  RBracket = 'RBracket',
  Dot = 'Dot',
  Quote = 'Quote',
  Backtick = 'Backtick',
  Comma = 'Comma',
  CommaAt = 'CommaAt',
  Name = 'Name',
  Num = 'Num',
  Boolean = 'Boolean',
  Comment = 'Comment',
  Whitespace = 'Whitespace',
  Eof = 'Eof',
  Unknown = 'Unknown',
}
