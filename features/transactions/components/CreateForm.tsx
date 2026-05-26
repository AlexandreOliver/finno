"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";
import { ComponentProps, useMemo, useCallback } from "react";
import { useActionState, useState } from "react";

import { typesEnum } from "@/infra/database/schemas/Enums";

import clsx from "clsx";

import { CreateMovementAction } from "../actions/createMovements";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { findCategories } from "../services/findCategories";
import { findWallets } from "../services/findWallets";
import { useSession } from "@/hooks/useSession";
import { SelectField } from "./SelectField";
import { useQuery } from "@tanstack/react-query";

type FormProps = {
  variant: "Renda" | "Despesa" | "Investimento";
} & ComponentProps<"form">;

export function CreateForm({ className, variant, ...rest }: FormProps) {
  const { user } = useSession();
  const [type, setType] = useState(
    variant === "Renda" ? typesEnum.enumValues[1] : typesEnum.enumValues[0],
  );
  const [stateForm, formAction, isPedding] = useActionState(
    CreateMovementAction,
    { sucess: false },
  );
  const [amount, setAmount] = useState("");

  const { data: dataWallets } = useQuery({
    queryKey: ["wallets", { userId: user?.id }],
    queryFn: () =>
      findWallets({
        ownerId: user?.id as string,
        returnFields: ["id", "balance", "createdAt", "labelName", "updatedAt"],
      }),
    enabled: !!user?.id,
  });

  const { data: categories } = useQuery({
    queryKey: ["categorias", { userId: user?.id }],
    queryFn: () =>
      findCategories({
        userId: user?.id as string,
        returnFields: ["id", "label", "type"],
      }),
    enabled: !!user?.id,
  });

  const categoriesBytype = useMemo(() => {
    return categories?.filter((ctg) => ctg.type === type);
  }, [categories, type]);

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
      action={formAction}
      className={cn("grid items-start gap-6", className)}
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
        <Input
          id="description"
          type="text"
          name="description"
          placeholder="Insira aqui uma breve descrição"
          aria-invalid={stateForm.errors?.description ? "true" : "false"}
        />
        <FieldDescription className="text-red-500">
          {stateForm.errors?.description}
        </FieldDescription>
      </Field>
      <Field>
        <FieldLabel htmlFor="amount">Valor:</FieldLabel>
        <Input
          id="amount"
          type="text"
          placeholder="R$ 1232,56"
          autoComplete="off"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          onBlur={handleAmountBlur}
          aria-invalid={stateForm.errors?.amount ? "true" : "false"}
        />
        <input type="hidden" name="amount" value={normalizedAmount} />
        <FieldDescription className="text-red-500">
          {stateForm.errors?.amount}
        </FieldDescription>
      </Field>
      <div className="flex gap-6">
        <div className="grid gap-3">
          <label htmlFor="categoryId">Categoria: </label>
          <SelectField
            key={type}
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
      {stateForm.message && (
        <p
          id="aria-form"
          aria-atomic="true"
          aria-live="polite"
          className={`${stateForm.sucess ? "text-green-500" : "text-red-500"}  text-sm`}
        >
          {stateForm.message}
        </p>
      )}
      <Button type="submit">
        {isPedding ? <Loader2 className="animate-spin" /> : "Save changes"}
      </Button>
    </form>
  );
}
