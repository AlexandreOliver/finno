import { Plus } from "lucide-react";
import { ComponentProps } from "react";

type ButtonCreateProps = {
  variant: "Renda" | "Despesa" | "Investimento";
  label: string;
} & ComponentProps<"button">;

export function ButtonCreate({ variant, label, ...rest }: ButtonCreateProps) {
  let styles = "";

  if (variant === "Renda") {
    styles =
      "border-green-400 dark:border-green-800 hover:bg-green-400/20 text-green-700 dark:text-green-300";
  } else if (variant === "Despesa") {
    styles =
      "border-red-400 dark:border-red-800 hover:bg-red-400/20 text-red-700 dark:text-red-400";
  }

  return (
    <button className={`border flex p-2 rounded-md ${styles}`} {...rest}>
      <Plus className="inline mr-1" />
      <span>{label}</span>
    </button>
  );
}
