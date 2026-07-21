"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

import { SelectField } from "./SelectField";

import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

import { useState } from "react";
import { ComponentProps, useMemo, useCallback } from "react";

import { TYPES_TRANSACTION } from "@/domain/enums";

import { movementsQuerys } from "@/features/Provider/queryKeys";

import { useSession } from "@/hooks/useSession";
import { useCriarMovement } from "@/features/transactions/hooks/useCriarMovement";
import { useCategories } from "@/features/transactions/hooks/useCategories";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";

type FormProps = {
  variant: "Renda" | "Despesa" | "Investimento";
} & ComponentProps<"form">;

export function CreateMovementForm({ className, variant, ...rest }: FormProps) {
  const { range } = useRangeDate();
  const { user } = useSession();
  const [type, setType] = useState(
    variant === "Renda" ? TYPES_TRANSACTION[1] : TYPES_TRANSACTION[0],
  );
  const [amount, setAmount] = useState("");

  // ----------- Tanstack -----------
  const { data: dataWallets } = useWallets(user?.id as string);

  const { data: categories } = useCategories({
    userId: user?.id,
    returnFields: ["id", "label", "type"],
  });

  const {
    mutate,
    data: stateForm,
    isPending,
  } = useCriarMovement(
    movementsQuerys
      .owned(dataWallets?.map((w) => w.id) as string[])
      ._ctx.query({
        date: {
          start: range.start.toISOString().slice(0, 10),
          end: range.end.toISOString().slice(0, 10),
        },
      }).queryKey,
  );

  // ----------- Memos ----------------
  const categoriesBytype = useMemo(() => {
    return categories?.filter((ctg) => ctg.type === type);
  }, [categories, type]);

  // ------------ useCallback -----------
  const normalizeCurrencyString = useCallback((input: string) => {
    if (typeof input !== "string" || input === "") return "";
    let strInput = input;
    strInput = strInput.replace(/\s+/g, "");
    strInput = strInput.replace(/(?!.\d+$)\./g, "");
    if (strInput.includes(",")) {
      strInput = strInput.replace(",", ".");
    }
    return strInput;
  }, []);

  const formatCurrencyDisplay = useCallback(
    (input: string) => {
      const normalized = normalizeCurrencyString(input);
      const numericValue = Number(normalized);
      if (Number.isNaN(numericValue)) return input;

      return new Intl.NumberFormat("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(numericValue);
    },
    [normalizeCurrencyString],
  );

  const handleAmountBlur = () => {
    const formatted = formatCurrencyDisplay(amount);
    setAmount(formatted);
  };

  const normalizedAmount = normalizeCurrencyString(amount);

  return (
    <form
      aria-describedby="aria-form"
      action={mutate}
      className={cn(
        "grid items-start gap-2 overflow-y-auto no-scrollbar h-115",
        className,
      )}
      {...rest}
    >
      <div className="grid grid-cols-2 gap-3 px-2">
        <button
          type="button"
          onClick={() => {
            setType("credito");
            // setSelectedCategory(null);
          }}
          className={clsx(
            "border border-green-400 dark:border-green-800  p-2 text-center text-xl rounded-sm text-green-700 dark:text-green-300",
            type === "credito" ? "bg-green-400/20" : "hover:bg-green-400/20",
          )}
        >
          Renda
        </button>
        <button
          type="button"
          onClick={() => {
            setType("debito");
            // setSelectedCategory(null);
          }}
          className={clsx(
            "border border-red-400 dark:border-red-700 p-2 text-center text-xl rounded-sm text-red-700 dark:text-red-600",
            type === "debito" ? "bg-red-700/30" : "hover:bg-red-700/30",
          )}
        >
          Despesa
        </button>
        <input name="type" className="hidden" value={type} readOnly></input>
      </div>
      <Field>
        <FieldLabel htmlFor="description">Descrição:</FieldLabel>
        <FieldContent>
          <Textarea
            id="description"
            name="description"
            maxLength={100}
            aria-invalid={stateForm?.errors?.description ? "true" : "false"}
            placeholder="Insira aqui uma breve descrição"
          />
        </FieldContent>
        <FieldDescription className="text-red-500">
          {stateForm?.errors?.description}
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="amount">Valor:</FieldLabel>
        <Input
          id="amount"
          type="text"
          placeholder="R$ 1.232,56"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={handleAmountBlur}
          aria-invalid={stateForm?.errors?.amount ? "true" : "false"}
        />
        <input type="hidden" name="amount" value={normalizedAmount} />
        <FieldDescription className="text-red-500">
          {stateForm?.errors?.amount}
        </FieldDescription>
      </Field>
      <div className="flex gap-6">
        <div className="grid gap-3">
          <label htmlFor="categoryId">Categoria: </label>
          <SelectField
            type={type}
            nameForm="categoryId"
            data={categoriesBytype ?? [{ id: "noFound", label: "" }]}
            isError={stateForm?.errors?.categoryId ? true : false}
            placeholder="Categorias"
          />
        </div>
        <div className="grid gap-3">
          <label htmlFor="walletId">Carteira de Origem:</label>
          <SelectField
            nameForm="walletId"
            data={
              dataWallets
                ? dataWallets.map((w) => {
                    return {
                      id: w.id,
                      label: w.labelName,
                    };
                  })
                : [{ id: "error", label: "noFound" }]
            }
            isError={stateForm?.errors?.walletId ? true : false}
            placeholder="Carteiras"
          />
        </div>
      </div>
      {stateForm?.message && (
        <p
          id="aria-form"
          aria-atomic="true"
          aria-live="polite"
          className={`${stateForm?.success ? "text-green-500" : "text-red-500"}  text-sm`}
        >
          {stateForm?.message}
        </p>
      )}
      <Button type="submit">
        {isPending ? <Loader2 className="animate-spin" /> : "Save changes"}
      </Button>
    </form>
  );
}
