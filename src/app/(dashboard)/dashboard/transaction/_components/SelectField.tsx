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
  data?: {
    value: string;
    label: string;
  }[];
  type?: string;
}

export function SelectField(props: SelectFieldProps) {
  return (
    <Select key={props.type} name={props.nameForm} items={props.data}>
      <SelectTrigger className="w-35" aria-invalid={props.isError}>
        <SelectValue placeholder={props.placeholder} />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          {props.data &&
            props.data.map((ctg) => (
              <SelectItem key={ctg.value} value={ctg}>
                {ctg.label}
              </SelectItem>
            ))}
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}
