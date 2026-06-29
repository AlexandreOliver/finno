"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { SelectField } from "./SelectField";
import { DateRangeComponent } from "@/app/(dashboard)/dashboard/_components";

import { cn } from "@/lib/utils";
import { DateRange } from "react-day-picker";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

import { useState } from "react";
import { ComponentProps, useMemo, useCallback } from "react";

import { typesEnum } from "@/infrastructure/database/schemas/Enums";

import { movementsQuerys } from "@/features/Provider/queryKeys";

import { useSession } from "@/hooks/useSession";
import { useCriarMovement } from "@/features/dashboard/statement/hooks/useCriarMovement";
import { useCategories } from "@/features/dashboard/statement/hooks/useCategories";
import { useWallets } from "@/features/dashboard/statement/hooks/useWallets";

type FormProps = {
  variant: "Renda" | "Despesa" | "Investimento";
} & ComponentProps<"form">;

export function CreateForm({ className, variant, ...rest }: FormProps) {
  const { user } = useSession();
  const [type, setType] = useState(
    variant === "Renda" ? typesEnum.enumValues[1] : typesEnum.enumValues[0],
  );
  const [amount, setAmount] = useState("");
  const [isReccurent, setIsReccurent] = useState(false);
  const [selectDateRange, setDateRange] = useState<DateRange | undefined>();

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
          start: new Date(
            new Date().getFullYear(),
            new Date().getMonth(),
            1,
          ).toLocaleDateString("en-US"),
          end: new Date().toLocaleDateString("en-US"),
        },
      }).queryKey,
  );

  // ----------- Memos ----------------
  const categoriesBytype = useMemo(() => {
    return categories?.filter((ctg) => ctg.type === type);
  }, [categories, type]);

  console.log(categoriesBytype);

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
      {/**
      <Field orientation="horizontal">
        <Checkbox
          id="isReccurent"
          name="isReccurent"
          checked={isReccurent ?? false}
          uncheckedValue="off"
          onCheckedChange={() => setIsReccurent(!isReccurent)}
        />
        <FieldLabel htmlFor="isReccurent" className="text-md">
          É Recorrente?
        </FieldLabel>
      </Field>
      <FieldSeparator hidden={!isReccurent} />
      <FieldSet hidden={!isReccurent}>
        <FieldLegend>Transação Recorrente</FieldLegend>
        <FieldDescription>Forneça algumas informações extras</FieldDescription>
        <FieldGroup>
          <Field>
            <FieldLabel htmlFor="status-checkbox">
              Status<span className="text-destructive text-lg">*</span>
            </FieldLabel>
            <RadioGroup id="status-checkbox" defaultValue="ativo" name="status">
              <div className="flex">
                <Field orientation="horizontal">
                  <RadioGroupItem value="ativo" id="ativo-status" />
                  <FieldLabel htmlFor="ativo-status">Ativo</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="pausado" id="pausado-status" />
                  <FieldLabel htmlFor="pausado-status">Pausado</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="terminado" id="terminado-status" />
                  <FieldLabel htmlFor="terminado-status">Terminado</FieldLabel>
                </Field>
              </div>
            </RadioGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="freq-checkbox">
              Frequência<span className="text-destructive text-lg">*</span>
            </FieldLabel>
            <RadioGroup
              id="freq-checkbox"
              defaultValue="monthly"
              name="frequency"
            >
              <div className="flex">
                <Field orientation="horizontal">
                  <RadioGroupItem value="daily" id="daily-freq" />
                  <FieldLabel htmlFor="daily-freq">Diário</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="weekly" id="weekly-freq" />
                  <FieldLabel htmlFor="pausado-freq">Semanal</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="monthly" id="monthly-freq" />
                  <FieldLabel htmlFor="monthly-freq">Mensal</FieldLabel>
                </Field>
                <Field orientation="horizontal">
                  <RadioGroupItem value="yearly" id="yearly-freq" />
                  <FieldLabel htmlFor="yearly-freq">Anual</FieldLabel>
                </Field>
              </div>
            </RadioGroup>
          </Field>
          <Field>
            <FieldLabel htmlFor="interval-input">
              Intervalo<span className="text-destructive text-lg">*</span>
            </FieldLabel>
            <FieldDescription className="">
              Dada uma frequência, defina qual o intervalo.
              <br /> Ex: a cada 1 mês, a cada 5 dias, a cada 3 meses.
            </FieldDescription>
            <Input id="interval-input" type="number" name="interval" min={1} />
            <FieldError
              errors={stateForm?.errors?.interval?.map((a) => {
                if (a) {
                  return { message: a };
                }
              })}
            ></FieldError>
          </Field>
          <Field>
            <FieldLabel htmlFor="installments-input">Parcelas</FieldLabel>
            <Input
              id="installments-input"
              name="installments"
              type="number"
              min={0}
            />
            <FieldDescription>Se não houver, deixe vazio</FieldDescription>
            <FieldError
              errors={stateForm?.errors?.installments?.map((a) => {
                if (a) {
                  return { message: a };
                }
              })}
            ></FieldError>
          </Field>
          <Field>
            <input
              id="input-start"
              name="start_date"
              type="date"
              defaultValue={selectDateRange?.from?.toISOString().slice(0, 10)}
              hidden
            />
            <input
              id="input-end"
              name="end_date"
              type="date"
              defaultValue={selectDateRange?.to?.toISOString().slice(0, 10)}
              hidden
            />
            <FieldLabel htmlFor="installments-input">
              Duração<span className="text-destructive text-lg">*</span>
            </FieldLabel>
            <DateRangeComponent
              interval={selectDateRange}
              setInterval={setDateRange}
              limitar={false}
            />
            <FieldDescription>Inicio e fim </FieldDescription>
            <FieldError
              errors={stateForm?.errors?.start_date?.map((a) => {
                if (a) {
                  return { message: a };
                }
              })}
            ></FieldError>
            <FieldError
              errors={stateForm?.errors?.end_date?.map((a) => {
                if (a) {
                  return { message: a };
                }
              })}
            ></FieldError>
          </Field>
        </FieldGroup>
      </FieldSet>*/}
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
