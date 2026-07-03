"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { ArrowRight, CircleAlertIcon, Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

import { registerAction, State } from "../actions/registerAction";
import { ButtonGroup } from "@/components/ui/button-group";

import { useActionState, useState } from "react";

export default function LoginForm() {
  const [nome, setNome] = useState("");
  const [sobrenome, setSobrenome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [cfm_senha, setCfm] = useState("");

  const [view1, setView1] = useState(false);
  const [view2, setView2] = useState(false);

  const stateInitial: State = { message: "", errors: {} };
  const [stateForm, siginUpAction, isPending] = useActionState(
    registerAction,
    stateInitial,
  );

  return (
    <form
      aria-describedby="auth-form"
      action={siginUpAction}
      className="space-y-2 p-2 rounded-md flex flex-col justify-between "
    >
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-name" className="pl-1 text-sm md:text-md">
          Nome
        </Label>
        <Input
          id="input-name"
          name="nome"
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Odisseu"
          autoComplete="off"
          aria-describedby="aria-name"
        />
        <div id="aria-name" aria-live="polite" aria-atomic="true">
          {stateForm?.errors?.firstName && (
            <p className="mt-2 text-[12px] text-red-500">
              {stateForm.errors.firstName[0]}
            </p>
          )}
        </div>
      </div>
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-sobrenome" className="pl-1 text-sm md:text-md">
          Sobrenome
        </Label>
        <Input
          id="input-sobrenome"
          name="sobrenome"
          type="text"
          value={sobrenome}
          onChange={(e) => setSobrenome(e.target.value)}
          placeholder="Filho de Atreus"
          autoComplete="off"
          aria-describedby="aria-sobrenome"
        />
        <div id="aria-sobrenome" aria-live="polite" aria-atomic="true">
          {stateForm?.errors?.lastName && (
            <p className="mt-2 text-[12px] text-red-500">
              {stateForm.errors.lastName[0]}
            </p>
          )}
        </div>
      </div>
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-email" className="pl-1 text-sm md:text-md">
          Email
        </Label>
        <Input
          id="input-email"
          name="email"
          type="text"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="coroa@itaca.net"
          autoComplete="off"
          aria-describedby="aria-email"
        />
        <div id="aria-email" aria-live="polite" aria-atomic="true">
          {stateForm?.errors?.email && (
            <p className="mt-2 text-[12px] text-red-500">
              {stateForm.errors.email[0]}
            </p>
          )}
        </div>
      </div>
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-password" className="pl-1 text-sm md:text-md">
          Senha
        </Label>
        <ButtonGroup aria-describedby="aria-password" className="w-full">
          <Input
            id="input-password"
            name="password"
            type={view1 ? "text" : "password"}
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="password123"
            autoComplete="off"
          />
          <Button
            size="icon"
            className="text-foreground"
            type="button"
            variant="ghost"
            onClick={() => setView1(!view1)}
          >
            {view1 ? <Eye /> : <EyeOff />}
          </Button>
        </ButtonGroup>
        <div id="aria-password" aria-live="polite" aria-atomic="true">
          {stateForm?.errors?.password && (
            <p className="mt-2 text-[12px] text-red-500">
              {stateForm.errors.password[0]}
            </p>
          )}
        </div>
      </div>
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-cfm-password" className="pl-1 text-sm md:text-md">
          Confirme sua Senha
        </Label>
        <ButtonGroup aria-describedby="aria-cfm-password" className="w-full">
          <Input
            id="input-cfm-password"
            name="cfm_password"
            type={view2 ? "text" : "password"}
            value={cfm_senha}
            onChange={(e) => setCfm(e.target.value)}
            placeholder="password123"
            autoComplete="off"
          />
          <Button
            size="icon"
            className="text-foreground"
            type="button"
            variant="ghost"
            onClick={() => setView2(!view2)}
          >
            {view2 ? <Eye /> : <EyeOff />}
          </Button>
        </ButtonGroup>
        <div id="aria-cfm-password" aria-live="polite" aria-atomic="true">
          {stateForm?.errors?.cfm_password && (
            <p className="mt-2 text-[12px] text-red-500">
              {stateForm.errors.cfm_password[0]}
            </p>
          )}
        </div>
      </div>

      {stateForm?.message && (
        <div
          id="auth-form"
          aria-live="polite"
          aria-atomic="true"
          className="flex gap-1"
        >
          <CircleAlertIcon className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-500">{stateForm.message}</p>
        </div>
      )}
      <div className="p-2 ">
        <Button
          type="submit"
          className="bg-blue-600 w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" /> {"Enviando..."}
            </>
          ) : (
            <>
              Criar
              <ArrowRight className="h-5 w-7" />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
