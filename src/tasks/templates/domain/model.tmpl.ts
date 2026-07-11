import { randomUUID } from "crypto";

export class __PASCAL_NAME__ {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly createdAt: Date,
  ) {}

  static create(props: { name: string }): __PASCAL_NAME__ {
    return new __PASCAL_NAME__(randomUUID(), props.name, new Date());
  }
}