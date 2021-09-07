import { Lexer, TokenKind, Token } from '../lexer';

function tokens(lexer: Lexer): Token[] {
  const out = [];
  while (lexer.peek().kind !== TokenKind.Eof) {
    out.push(lexer.pop());
  }
  return out;
}

function tokenKinds(lexer: Lexer): TokenKind[] {
  return tokens(lexer).map(({ kind }) => kind);
}

describe('Lexer', () => {
  test('Delimiters and Punctuation', () => {
    const l = new Lexer("[.](,)`,,@,'");

    const kinds = tokenKinds(l);
    expect(kinds).toEqual([
      TokenKind.LBracket,
      TokenKind.Dot,
      TokenKind.RBracket,
      TokenKind.LParen,
      TokenKind.Comma,
      TokenKind.RParen,
      TokenKind.Backtick,
      TokenKind.Comma,
      TokenKind.CommaAt,
      TokenKind.Comma,
      TokenKind.Quote,
    ]);
  });

  test('Booleans', () => {
    const l = new Lexer('#t #f #x');

    const kinds = tokenKinds(l);
    expect(kinds).toEqual([
      TokenKind.Boolean,
      TokenKind.Whitespace,
      TokenKind.Boolean,
      TokenKind.Whitespace,
      TokenKind.Unknown,
      TokenKind.Name,
    ]);
  });

  test('Numbers', () => {
    const l = new Lexer('42 1234');

    const kinds = tokenKinds(l);
    expect(kinds).toEqual([TokenKind.Num, TokenKind.Whitespace, TokenKind.Num]);
  });

  test('Names', () => {
    const l = new Lexer('symbol->string string-append * + test/ing');

    const kinds = tokenKinds(l);
    expect(kinds).toEqual([
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Name,
    ]);
  });

  test('Comments', () => {
    const l = new Lexer(';; A quick comment\ntoo #t');

    const kinds = tokenKinds(l);
    expect(kinds).toEqual([
      TokenKind.Comment,
      TokenKind.Whitespace,
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Boolean,
    ]);
  });

  test('Simple Expressions', () => {
    const l = new Lexer('(define quux 42)');

    const kinds = tokenKinds(l);
    expect(kinds).toEqual([
      TokenKind.LParen,
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Name,
      TokenKind.Whitespace,
      TokenKind.Num,
      TokenKind.RParen,
    ]);
  });
});
