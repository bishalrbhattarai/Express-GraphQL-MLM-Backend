declare module "koa" {
  export type DefaultContext = any;
  export type DefaultState = any;
  export type Middleware<StateT = DefaultState, ContextT = DefaultContext> = (
    ctx: ContextT,
    next: () => Promise<any>
  ) => Promise<any>;
}
