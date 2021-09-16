// The LL(1) grammar we're using:
//
// File = Trivia* Expr*(Trivia)
//
// Expr = Number
//      | Boolean
//      | Symbol
//      | "'" Expr
//      | "`" Expr
//      | "," Expr
//      | ",@" Expr
//      | "(" Comp
//
// Comp = ")"
//      | Expr+ CompEnd
//
// CompEnd = ")"
//         | "." Expr ")"
//         | "..." ")"
//         | "..1" ")"
//
// Trivia = Whitespace
//        | Comment
//        | Unknown
//
// NOTE All occurrences of "(" and ")" can be replaced by "[" and "]". We
// need to make sure that these are matched.

import { Lexer, TokenKind as Tk } from './lexer';
import { Expr } from './expr';

export function parseFile(tokens: Lexer): Expr[] {
  const exprs = [];

  while (tokens.peek().kind !== Tk.Eof) {
    exprs.push(parseExpr(tokens));
  }

  return exprs;
}

export function parseExpr(tokens: Lexer): Expr {
  skipTrivia(tokens);

  const next = tokens.pop();
  if (next.kind === Tk.Number) {
    return Expr.Number(Number(next.text));
  } else if (next.kind === Tk.Boolean) {
    return Expr.Boolean(next.text === '#t');
  } else if (next.kind === Tk.Symbol) {
    return Expr.Symbol(next.text);
  } else if (SPECIAL.includes(next.kind)) {
    const inner = parseExpr(tokens);
    const symbol = SPECIAL_SYMBOLS[next.kind];
    return Expr.Cons(Expr.Symbol(symbol), Expr.Cons(inner, Expr.Nil()));
  } else if ([Tk.LParen, Tk.LBracket].includes(next.kind)) {
    return parseComp(tokens, next.kind);
  } else {
    throw new Error('expected an expression');
  }
}

function parseComp(tokens: Lexer, open: Tk): Expr {
  const close = closerFor(open);
  skipTrivia(tokens);

  const peek = tokens.peek();
  if (peek.kind === close) {
    tokens.pop();
    return Expr.Nil();
  } else {
    const es: Expr[] = [];
    let final = Expr.Nil();

    while (!COMP_ENDERS.includes(tokens.peek().kind)) {
      es.push(parseExpr(tokens));
      skipTrivia(tokens);
    }

    const peek = tokens.peek();
    if (peek.kind === Tk.Dot) {
      tokens.pop();
      final = parseExpr(tokens);
    } else if (peek.kind === Tk.Ellipsis) {
      tokens.pop();
      const final = Number(peek.text.slice(2));
      const count = isNaN(final) ? 0 : final;
      es.push(Expr.Ellipsis(count));
    }

    skipTrivia(tokens);
    if (tokens.peek().kind !== close) {
      const closerText = close === Tk.RParen ? ')' : ']';
      throw new Error(`expected "${closerText}"`);
    }

    tokens.pop();
    return es.reduceRight((cdr, car) => Expr.Cons(car, cdr), final);
  }
}

const COMP_ENDERS = [Tk.RParen, Tk.RBracket, Tk.Dot, Tk.Ellipsis, Tk.Eof];

function closerFor(open: Tk): Tk {
  if (open === Tk.LParen) {
    return Tk.RParen;
  } else if (open === Tk.LBracket) {
    return Tk.RBracket;
  } else {
    throw new Error(`${open} is not a compound expression opener`);
  }
}

function skipTrivia(tokens: Lexer) {
  while (true) {
    const peek = tokens.peek();
    if (TRIVIA.includes(peek.kind)) {
      tokens.pop();
      if (peek.kind === Tk.Unknown) {
        throw new Error(`unknown token: "${peek.text}"`);
      }
    } else {
      break;
    }
  }
}

const SPECIAL = [Tk.Quote, Tk.Backtick, Tk.Comma, Tk.CommaAt];

const SPECIAL_SYMBOLS: { [key: string]: string } = {
  [Tk.Quote]: 'quote',
  [Tk.Backtick]: 'quasiquote',
  [Tk.Comma]: 'unquote',
  [Tk.CommaAt]: 'unquote-splicing',
};

const TRIVIA = [Tk.Whitespace, Tk.LineComment, Tk.Unknown];
