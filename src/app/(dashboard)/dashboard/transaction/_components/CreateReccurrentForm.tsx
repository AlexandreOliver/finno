"use client";

import {
  Field,
  FieldDescription,
  FieldError,
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
import { format } from "date-fns";
import { ChevronDownIcon } from "lucide-react";
import { ptBR } from "date-fns/locale";
import { useCriarMovement } from "@/features/transactions/hooks/useCriarMovement";
import { movementsQuerys } from "@/features/Provider/queryKeys";
import { useRangeDate } from "@/features/transactions/hooks/use-rangeDate";

export function CreatereccurrentForm() {
  const { user } = useSession();
  const { range } = useRangeDate();
  const [inputAmount, setAmount] = useState("");
  const [selectType, setType] = useState<{
    label: string;
    value: string;
  } | null>(null);
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();

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
  } = useCriarMovement(
    movementsQuerys.owned(wallets?.map((w) => w.value) as string[])._ctx.query({
      date: {
        start: range.start.toISOString().slice(0, 10),
        end: range.end.toISOString().slice(0, 10),
      },
    }).queryKey,
  );

  return (
    <form>
      <FieldGroup>
        <FieldSet className="overflow-y-auto no-scrollbar h-135">
          <FieldLegend>Transação Recorrente</FieldLegend>
          <FieldDescription>
            Uma transação recorrente é uma movimentação financeira que ocorrerá
            periodicamente, compras/vendas parceladas.
          </FieldDescription>

          <FieldSet>
            <FieldLegend>Informações Gerais</FieldLegend>
            <FieldGroup>
              {/* <Field>
              <FieldLabel>Informações:</FieldLabel>
              <FieldDescription>1 -</FieldDescription>
              
            </Field> */}
              {/* <Field>
              <FieldLabel htmlFor="status-checkbox">
                Status<span className="text-destructive text-md">*</span>
              </FieldLabel>
              <RadioGroup
                id="status-checkbox"
                defaultValue="ativo"
                name="status"
              >
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
                    <FieldLabel htmlFor="terminado-status">
                      Terminado
                    </FieldLabel>
                  </Field>
                </div>
              </RadioGroup>
            </Field> */}
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
                />
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
                  />
                  <input type="hidden" name="amount" value={normalizedAmount} />
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
                      Opicional - Nem toda recorrência terá uma um numero fixo
                      de parcelas, mas para fins de cálculo o sistema inferirá
                      as parcelas com base na data inicial e final.
                    </p>
                  </details>
                  <details>
                    <summary className="font-medium">Frenquência</summary>
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
                  />
                  <FieldError
                  //   errors={stateForm?.errors?.interval?.map((a) => {
                  //     if (a) {
                  //       return { message: a };
                  //     }
                  //   })}
                  ></FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="installments-input" className="py-0.5">
                    Parcelas
                  </FieldLabel>
                  <Input
                    id="installments-input"
                    name="installments"
                    type="number"
                    min={0}
                  />
                  <FieldError
                  //   errors={stateForm?.errors?.installments?.map((a) => {
                  //     if (a) {
                  //       return { message: a };
                  //     }
                  //   })}
                  ></FieldError>
                </Field>
              </div>
            </FieldGroup>
            <FieldSet>
              <FieldLegend>Duração</FieldLegend>
              <details className="text-muted-foreground">
                <summary className="font-medium">Inicio</summary>
                <p>
                  Data de inicio da reccorência, pode ser hoje ou futura. <br />
                  Sendo hoje, irá gerar automaticamente uma nova movimentação.
                  <br />
                  Sendo futura, irá gerar uma movimentação assim que iniciar.
                </p>
              </details>
              <details className="text-muted-foreground">
                <summary className="font-medium">Fim</summary>
                <p>
                  Opicional. Se não fornecida será inferida usando as parcelas
                  como base. <br />
                  Se não houver parcelas, a recorrência continuará
                  indefinidamente.
                </p>
              </details>
              <FieldGroup className="grid grid-cols-2 gap-8">
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
                        ]}
                        required
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError
                  //   errors={stateForm?.errors?.start_date?.map((a) => {
                  //     if (a) {
                  //       return { message: a };
                  //     }
                  //   })}
                  ></FieldError>
                </Field>
                <Field>
                  <FieldLabel htmlFor="input-end" className="py-0.5">
                    Fim
                  </FieldLabel>
                  <input
                    name="endDate"
                    type="text"
                    defaultValue={endDate?.toISOString().slice(0, 10)}
                    hidden
                  />
                  <Popover>
                    <PopoverTrigger
                      id="input-end"
                      render={
                        <Button
                          variant={"outline"}
                          data-empty={endDate}
                          className="w-53 justify-between text-left font-normal data-[empty=true]:text-muted-foreground"
                        >
                          {endDate ? (
                            format(endDate, "dd 'de' MMMM 'de' yyyy", {
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
                        selected={endDate}
                        onSelect={setEndDate}
                        captionLayout="dropdown"
                        defaultMonth={new Date()}
                        startMonth={startDate ? startDate : new Date()}
                        endMonth={new Date(2036, 0, 0)}
                        hidden={[
                          startDate != undefined && {
                            before: startDate,
                          },
                        ]}
                      />
                    </PopoverContent>
                  </Popover>
                  <FieldError
                  //   errors={stateForm?.errors?.end_date?.map((a) => {
                  //     if (a) {
                  //       return { message: a };
                  //     }
                  //   })}
                  ></FieldError>
                </Field>
              </FieldGroup>
            </FieldSet>
          </FieldSet>
        </FieldSet>
        <Field>
          <Button type="submit">Criar</Button>
        </Field>
      </FieldGroup>
    </form>
  );
}
