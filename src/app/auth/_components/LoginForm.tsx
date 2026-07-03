"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

import { ArrowUpRightIcon, CircleAlertIcon, Loader2 } from "lucide-react";
import { Eye, EyeOff } from "lucide-react";

import { loginAction } from "../actions/loginAction";
import { ButtonGroup } from "@/components/ui/button-group";

import { useActionState, useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("coroa@itaca.ageu");
  const [senha, setSenha] = useState("rei-de-itaca");

  const [view, setView] = useState(false);
  const [errorMessage, sigInAction, isPending] = useActionState(
    loginAction,
    null,
  );

  return (
    <form
      aria-describedby="auth-form"
      action={sigInAction}
      className="space-y-2 p-2 rounded-md flex flex-col justify-between "
    >
      <input type="hidden" name="redirectTo" defaultValue="/dashboard" />
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-email" className="pl-1 text-sm md:text-lg">
          Email
        </Label>
        <Input
          id="input-email"
          name="email"
          type="text"
          placeholder="finno-admin@finno.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="off"
          aria-describedby="aria-email"
          className="placeholder:text-md md:text-md"
        />
        <div
          id="aria-email"
          aria-live="polite"
          aria-atomic="true"
          className="h-2 mt-2"
        >
          <p className=" text-sm text-red-500">
            {errorMessage?.errors?.email ? errorMessage?.errors?.email[0] : ""}
          </p>
        </div>
      </div>
      <div className=" flex-col flex p-2">
        <Label htmlFor="input-password" className="pl-1 text-sm md:text-lg">
          Password
        </Label>
        <ButtonGroup aria-describedby="aria-password" className="w-full">
          <Input
            id="input-password"
            name="password"
            type={view ? "text" : "password"}
            placeholder="password123"
            defaultValue="rei-de-itaca"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            autoComplete="off"
            className="placeholder:text-md md:text-md"
          />
          <Button
            size="icon"
            className="text-foreground"
            type="button"
            variant="outline"
            onClick={() => setView(!view)}
          >
            {view ? <Eye /> : <EyeOff />}
          </Button>
        </ButtonGroup>
        <div
          id="aria-password"
          aria-live="polite"
          aria-atomic="true"
          className="h-2 mt-2"
        >
          <p className="text-sm text-red-500">
            {errorMessage?.errors?.password
              ? errorMessage?.errors?.password[0]
              : ""}
          </p>
        </div>
      </div>
      {errorMessage?.message && (
        <div
          id="auth-form"
          aria-live="polite"
          aria-atomic="true"
          className="flex gap-1"
        >
          <CircleAlertIcon className="h-5 w-5 text-red-500" />
          <p className="text-sm text-red-500">{errorMessage.message}</p>
        </div>
      )}
      <div className="p-2 mt-3">
        <Button
          type="submit"
          className="bg-blue-600 w-full"
          disabled={isPending}
        >
          {isPending ? (
            <>
              <Loader2 className="animate-spin" />
              <span>Enviando...</span>
            </>
          ) : (
            <>
              <span className="text-lg">Login</span>
              <ArrowUpRightIcon size={75} />
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
