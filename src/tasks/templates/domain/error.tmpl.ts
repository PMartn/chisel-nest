export class __PASCAL_NAME__NotFoundError extends Error {
  constructor(id: string) {
    super(`__PASCAL_NAME__ with id "${id}" was not found`);
    this.name = "__PASCAL_NAME__NotFoundError";
  }
}
