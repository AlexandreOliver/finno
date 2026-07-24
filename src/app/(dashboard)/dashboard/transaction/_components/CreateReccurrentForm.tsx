"use client";

import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
} from "@/components/ui/field";

import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useCallback, useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "@/components/ui/select";
import { useWallets } from "@/features/dashboard/hooks/useWallets";
import { useSession } from "@/hooks/useSession";
import { useCategories } from "@/features/transactions/hooks/useCategories";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format, isAfter, isBefore } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { movementsQuerys } from "@/features/Provider/queryKeys";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";
import { useCriarReccurent } from "@/features/transactions/hooks/useCriarReccurrent";
import { Checkbox } from "@/components/ui/checkbox";

export function CreateReccurrentForm() {
  const { user } = useSession();
  const { range } = useRangeDate();
  const [inputAmount, setAmount] = useState("");
  const [selectType, setType] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate] = useState<Date>();

  const { data: walletsFromDb, isLoading: isLoadingWallet } = useWallets(
    user?.id as string,
  );

  const { data: categoriesFromDb, isLoading: isLoadingCategories } =
    useCategories({
      userId: user?.id,
      returnFields: ["id", "label", "type"],
    });

  const types = [
    {
      label: "Saida",
      value: "debito",
    },
    {
      label: "Entrada",
      value: "credito",
    },
  ];

  const categories = useMemo(() => {
    const categoriesFiltred = categoriesFromDb?.filter(
      (ctg) => ctg.type === selectType?.value,
    );

    return categoriesFiltred?.map((ctg) => {
      return { label: ctg.label, value: ctg.id };
    });
  }, [categoriesFromDb, selectType]);

  const wallets = useMemo(() => {
    return walletsFromDb?.map((w) => {
      return {
        label: w.labelName,
        value: w.id,
      };
    });
  }, [walletsFromDb]);

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
    const formatted = formatCurrencyDisplay(inputAmount);
    setAmount(formatted);
  };

  const normalizedAmount = normalizeCurrencyString(inputAmount);

  const {
    mutate,
    data: stateForm,
    isPending,
  } = useCriarReccurent(
    movementsQuerys.owned(wallets?.map((w) => w.value) as string[])._ctx.query({
      date: {
        start: range.start.toISOString().slice(0, 10),
        end: range.end.toISOString().slice(0, 10),
      },
    }).queryKey,
  );

  return (
    <form action={mutate}>
      <FieldGroup>
        <FieldSet className="overflow-y-auto no-scrollbar h-136">
          <FieldLegend>Transação Recorrente</FieldLegend>
          <FieldDescription>
            Uma transação recorrente é uma movimentação financeira que ocorrerá
            periodicamente, compras/vendas parceladas.
          </FieldDescription>

          <FieldSet>
            <FieldLegend>Informações Gerais</FieldLegend>
            <FieldDescription
              className={stateForm?.success ? "text-green-500" : "text-red-500"}
            >
              {stateForm?.message}
            </FieldDescription>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="label-description">
                  Descrição<span className="text-destructive text-base">*</span>
                </FieldLabel>
                <Textarea
                  id="label-description"
                  name="description"
                  placeholder="Descrição curta da movimentação"
                  required
                  rows={4}
                  aria-invalid={
                    stateForm?.errors?.description ? "true" : "false"
                  }
                />
                <FieldDescription className="text-red-500">
                  {stateForm?.errors?.description}
                </FieldDescription>
              </Field>
              <div className="grid grid-cols-2 gap-8">
                <Field>
                  <FieldLabel htmlFor="label-amount">
                    Valor<span className="text-destructive text-base">*</span>
                  </FieldLabel>
                  <Input
                    id="label-amount"
                    type="text"
                    placeholder="1.232,56"
                    value={inputAmount}
                    onChange={(e) => setAmount(e.target.value)}
                    onBlur={handleAmountBlur}
                    required
                    aria-invalid={stateForm?.errors?.amount ? "true" : "false"}
                  />
                  <input type="hidden" name="amount" value={normalizedAmount} />
                  <FieldDescription className="text-red-500">
                    {stateForm?.errors?.amount}
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="label-type">
                    Tipo<span className="text-destructive text-base">*</span>
                  </FieldLabel>
                  <Select
                    id="label-type"
                    name="type"
                    items={types}
                    value={selectType}
                    onValueChange={(e) => setType(e)}
                    isItemEqualToValue={(itemValue, value) =>
                      !!itemValue && !!value && itemValue.value === value.value
                    }
                    itemToStringValue={(item) => (item ? item.value : "")}
                    aria-invalid={stateForm?.errors?.type ? "true" : "false"}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {types.map((type) => (
                        <SelectItem key={type.value} value={type}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>
                <Field>
                  <FieldLabel htmlFor="label-carteira">
                    Carteira
                    <span className="text-destructive text-base">*</span>
                  </FieldLabel>
                  <Select
                    id="label-carteira"
                    name="walletId"
                    items={wallets}
                    defaultValue={null}
                    disabled={isLoadingWallet}
                    aria-invalid={
                      stateForm?.errors?.walletId ? "true" : "false"
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {wallets &&
                        wallets.map((wal) => (
                          <SelectItem key={wal.value} value={wal}>
                            {wal.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel htmlFor="label-categoria">
                    Categoria
                    <span className="text-destructive text-base">*</span>
                  </FieldLabel>
                  <Select
                    id="label-categoria"
                    key={selectType?.value}
                    name="categoryId"
                    items={categories}
                    defaultValue={null}
                    required
                    disabled={isLoadingCategories || categories?.length == 0}
                    aria-invalid={
                      stateForm?.errors?.categoryId ? "true" : "false"
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent alignItemWithTrigger={false}>
                      {categories &&
                        categories.map((ctg) => (
                          <SelectItem key={ctg.value} value={ctg}>
                            {ctg.label}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </Field>
              </div>
            </FieldGroup>
          </FieldSet>

          <FieldSeparator />
          <FieldSet>
            <FieldLegend>Dados de recorrência</FieldLegend>
            <FieldGroup>
              <Field>
                <FieldDescription>
                  Aqui voce configura a recorrencia podendo criar periodicidades
                  especificas, assegure que os dados estão corretos
                </FieldDescription>
                <div className="text-muted-foreground flex flex-col gap-1">
                  <details>
                    <summary className="font-medium">Parcelas</summary>
                    <p>
                      Opicional.
                      <br />
                      Nem toda recorrência terá uma um numero fixo de parcelas.
                      <br />
                      Havendo parcelas a data final da reccorência será inferida
                      com base nos demais dados de recorrência.
                    </p>
                  </details>
                  <details>
                    <summary className="font-medium">Frequência</summary>
                    <p>
                      Normalmente é mensal, mas outras são possiveis. Combine
                      com o intervalo para criar uma recorrencia adequada
                    </p>
                  </details>
                  <details>
                    <summary className="font-medium">Intervalo</summary>
                    <p>
                      A cada Mes - intervalo = 1 Frequência = mensal <br /> A
                      cada 2 Meses - intervalo = 2 Frequência = mensal <br /> A
                      cada 15 dias - intervalo = 15 Frequência = diaria
                    </p>
                  </details>
                </div>
              </Field>
              <Field>
                <FieldLabel htmlFor="freq-checkbox">
                  Frequência
                  <span className="text-destructive text-base">*</span>
                </FieldLabel>
                <RadioGroup
                  id="freq-checkbox"
                  defaultValue="monthly"
                  name="frequency"
                  required
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
              <div className="grid grid-cols-2 gap-8 items-baseline">
                <Field>
                  <FieldLabel htmlFor="interval-input">
                    Intervalo
                    <span className="text-destructive text-base">*</span>
                  </FieldLabel>
                  <Input
                    id="interval-input"
                    type="number"
                    name="interval"
                    required
                    min={1}
                    aria-invalid={
                      stateForm?.errors?.interval ? "true" : "false"
                    }
                  />
                  <FieldDescription className="text-red-500">
                    {stateForm?.errors?.interval}
                  </FieldDescription>
                </Field>
                <Field>
                  <FieldLabel htmlFor="installments-input" className="py-0.5">
                    Parcelas
                  </FieldLabel>
                  <Input
                    id="installments-input"
                    name="installments"
                    type="number"
                    aria-invalid={
                      stateForm?.errors?.installments ? "true" : "false"
                    }
                    min={0}
                  />
                  <FieldDescription className="text-red-500">
                    {stateForm?.errors?.installments}
                  </FieldDescription>
                </Field>
              </div>
            </FieldGroup>
            <FieldSet>
              <FieldLegend>Duração</FieldLegend>
              <FieldDescription>
                A data de inicio da recorrência, pode ser hoje ou futura. <br />
                Sendo hoje, irá gerar automaticamente uma nova movimentação.
                <br />
                Sendo futura, irá gerar uma movimentação assim que iniciar.
              </FieldDescription>
              <FieldDescription>
                A Data Final será inferida pelos parametros de reccorência,
                podendo não ter uma fixa
              </FieldDescription>
              <FieldGroup className="grid grid-cols-2 gap-8 items-center">
                <Field>
                  <FieldLabel htmlFor="input-start">
                    Inicio<span className="text-destructive text-base">*</span>
                  </FieldLabel>
                  <input
                    name="startDate"
                    type="text"
                    defaultValue={startDate?.toISOString().slice(0, 10)}
                    hidden
                  />
                  <Popover>
                    <PopoverTrigger
                      id="input-start"
                      aria-invalid={
                        stateForm?.errors?.startDate ? "true" : "false"
                      }
                      render={
                        <Button
                          variant={"outline"}
                          data-empty={startDate}
                          className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        >
                          {startDate ? (
                            format(startDate, "dd 'de' MMMM 'de' yyyy", {
                              locale: ptBR,
                            })
                          ) : (
                            <span>Escolha uma data</span>
                          )}
                          <ChevronDownIcon data-icon="inline-end" />
                        </Button>
                      }
                    />
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={ptBR}
                        mode="single"
                        selected={startDate}
                        onSelect={setStartDate}
                        captionLayout="dropdown"
                        defaultMonth={startDate}
                        startMonth={new Date()}
                        endMonth={endDate ? endDate : new Date(2036, 0, 0)}
                        hidden={[
                          endDate != undefined && {
                            after: endDate,
                          },
                          { before: new Date() },
                        ]}
                        required
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldDescription className="text-red-500">
                    {stateForm?.errors?.startDate}
                  </FieldDescription>
                </Field>
              </FieldGroup>
            </FieldSet>
            <Field orientation="horizontal">
              <Checkbox id="label-executedNow" name="payOnStartDate" />
              <FieldContent aria-disabled>
                <FieldLabel
                  htmlFor="label-executedNow"
                  className="sm:text-sm leading-5 font-light"
                >
                  Gerar nova movimentação na data de inicio?
                </FieldLabel>
              </FieldContent>
            </Field>
          </FieldSet>
          <FieldDescription
            className={stateForm?.success ? "text-green-500" : "text-red-500"}
          >
            {stateForm?.message}
          </FieldDescription>
        </FieldSet>
        <Field>
          <Button type="submit" disabled={isPending}>
            Criar
          </Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
