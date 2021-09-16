import { Lexer, TokenKind as Tk, Token } from '../lexer';

describe('Lexer', () => {
  describe('Delimiters and Punctuation (1)', () => {
    test('Delimiters (1)', () => {
      const source = '()[]';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.LParen, '('),
        new Token(Tk.RParen, ')'),
        new Token(Tk.LBracket, '['),
        new Token(Tk.RBracket, ']'),
      ]);
    });

    test('Punctuation (1)', () => {
      const source = ", ,@ . ... ..1 .. '` ..134";
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Comma, ','),
        new Token(Tk.CommaAt, ',@'),
        new Token(Tk.Dot, '.'),
        new Token(Tk.Ellipsis, '...'),
        new Token(Tk.Ellipsis, '..1'),
        new Token(Tk.Dot, '.'),
        new Token(Tk.Dot, '.'),
        new Token(Tk.Quote, "'"),
        new Token(Tk.Backtick, '`'),
        new Token(Tk.Ellipsis, '..134'),
      ]);
    });
  });

  describe('Numbers', () => {
    test('Positive Integers', () => {
      const source = '123 42';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Number, '123'),
        new Token(Tk.Number, '42'),
      ]);
    });

    test('Negative Integers', () => {
      const source = '-425 -2';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Number, '-425'),
        new Token(Tk.Number, '-2'),
      ]);
    });

    test('Fractional Numbers', () => {
      const source = '123.456 -12.4 4. .8';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Number, '123.456'),
        new Token(Tk.Number, '-12.4'),
        new Token(Tk.Number, '4.'),
        new Token(Tk.Number, '.8'),
      ]);
    });

    test('Edge Cases', () => {
      const source = '123.45.6 -.33';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Number, '123.45'),
        new Token(Tk.Number, '.6'),
        new Token(Tk.Number, '-.33'),
      ]);
    });
  });

  describe('Booleans', () => {
    test('Booleans (1)', () => {
      const source = '#t #f #something-else';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Boolean, '#t'),
        new Token(Tk.Boolean, '#f'),
        new Token(Tk.Unknown, '#something-else'),
      ]);
    });
  });

  describe('Symbols', () => {
    test('Symbols (1)', () => {
      const source = 'simple b1 * two-words >>= :<>: Y!';
      const ts = tokens(source);

      expect(ts).toEqual([
        new Token(Tk.Symbol, 'simple'),
        new Token(Tk.Symbol, 'b1'),
        new Token(Tk.Symbol, '*'),
        new Token(Tk.Symbol, 'two-words'),
        new Token(Tk.Symbol, '>>='),
        new Token(Tk.Symbol, ':<>:'),
        new Token(Tk.Symbol, 'Y!'),
      ]);
    });
  });

  describe('Trivia', () => {
    test('Trivia (1)', () => {
      const source = '     ;; A comment\n;;;; Another comment';
      const ts = tokens(source, true);

      expect(ts).toEqual([
        new Token(Tk.Whitespace, '     '),
        new Token(Tk.LineComment, ';; A comment'),
        new Token(Tk.Whitespace, '\n'),
        new Token(Tk.LineComment, ';;;; Another comment'),
      ]);
    });
  });
});

function tokens(source: string, includeWs = false): Token[] {
  const lexer = new Lexer(source);
  const out = [];
  while (lexer.peek().kind !== Tk.Eof) {
    out.push(lexer.pop());
  }
  return includeWs ? out : out.filter(t => t.kind !== Tk.Whitespace);
}
