export class Expr {
  kind: ExprKind;
  r1?: any;
  r2?: any;

  static Number(value: number): Expr {
    const out = new Expr();
    out.kind = ExprKind.Number;
    out.r1 = value;
    return out;
  }

  static Boolean(value: boolean): Expr {
    const out = new Expr();
    out.kind = ExprKind.Boolean;
    out.r1 = value;
    return out;
  }

  static Symbol(name: string): Expr {
    const out = new Expr();
    out.kind = ExprKind.Symbol;
    out.r1 = name;
    return out;
  }

  static Nil(): Expr {
    const out = new Expr();
    out.kind = ExprKind.Nil;
    return out;
  }

  static Cons(car: Expr, cdr: Expr): Expr {
    const out = new Expr();
    out.kind = ExprKind.Cons;
    out.r1 = car;
    out.r2 = cdr;
    return out;
  }

  static Ellipsis(count: number): Expr {
    const out = new Expr();
    out.kind = ExprKind.Ellipsis;
    out.r1 = count;
    return out;
  }

  match<A>(handlers: Match<A>): A {
    const fallback = handlers._ || missing;

    const {
      number = fallback,
      boolean = fallback,
      symbol = fallback,
      nil = fallback,
      cons = fallback,
      ellipsis = fallback,
    } = handlers;

    switch (this.kind) {
      case ExprKind.Number:
        return number(this.r1);
      case ExprKind.Boolean:
        return boolean(this.r1);
      case ExprKind.Symbol:
        return symbol(this.r1);
      case ExprKind.Nil:
        return nil();
      case ExprKind.Cons:
        return cons(this.r1, this.r2);
      case ExprKind.Ellipsis:
        return ellipsis(this.r1);
    }
  }
}

function missing<A>(): A {
  throw new Error('non-exhaustive handlers in `match`');
}

enum ExprKind {
  Number = 'Number',
  Boolean = 'Boolean',
  Symbol = 'Symbol',
  Nil = 'Nil',
  Cons = 'Cons',
  Ellipsis = 'Ellipsis',
}

interface Match<A> {
  number?: (value: number) => A;
  boolean?: (value: boolean) => A;
  symbol?: (name: string) => A;
  nil?: () => A;
  cons?: (car: Expr, cdr: Expr) => A;
  ellipsis?: (count: number) => A;
  _?: () => A;
}
