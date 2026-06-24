import { categories } from "@/infra/database/schemas/categories";

export type categoriesProps = typeof categories.$inferSelect;

export class Categories {
  private constructor(private readonly props: categoriesProps) {}

  public static create(props: categoriesProps) {
    return new Categories(props);
  }

  public static with(props: categoriesProps) {
    return new Categories(props);
  }

  //#region Getts
  public get id() {
    return this.props.id;
  }

  public get label() {
    return this.props.label;
  }

  public get description() {
    return this.props.description;
  }

  public get type() {
    return this.props.type;
  }

  public get userId() {
    return this.props.userId;
  }
  //#endregion

  public toJson<K extends keyof categoriesProps>(props?: {
    omit: readonly K[];
  }): Omit<categoriesProps, K> | categoriesProps {
    if (!props || !props.omit || props.omit.length === 0) {
      return this.props;
    }

    const data = Object.fromEntries(
      Object.entries(this.props).filter(([k]) => !(k in props.omit)),
    );

    return data as Omit<categoriesProps, (typeof props.omit)[number]>;
  }
}
