"use client";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface SelectFieldProps {
  isError: boolean;
  placeholder: string;
  nameForm: string;
  data: {
    id: string;
    label: string;
  }[];
  type?: string;
}

export function SelectField(props: SelectFieldProps) {
  return (
    <Select
      key={props.type}
      name={props.nameForm}
      itemToStringValue={(item: (typeof props.data)[number]) =>
        item ? item.id : ""
      }
      isItemEqualToValue={(itemValue, value) =>
        !!itemValue && !!value && itemValue.id === value.id
      }
    >
      <SelectTrigger className="w-35" aria-invalid={props.isError}>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.data.map((ctg) => (
            <SelectItem key={ctg.id} value={ctg}>
              {ctg.label}
            </SelectItem>
          ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
