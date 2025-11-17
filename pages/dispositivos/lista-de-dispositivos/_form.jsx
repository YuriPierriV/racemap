import React, { useEffect, useCallback } from "react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DeviceConnectionPanel } from "./_device-connected";
import { SheetClose, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const formSchema = z.object({
  deviceId: z
    .string()
    .min(6, "O ID do dispositivo deve ser válido")
    .max(6, "O ID do dispositivo deve ser válido"),
  checked: z.boolean().refine((value) => value === true, {
    message: "A conexão deve ser confirmada.",
  }),
});
export function DeviceForm() {
  // Define o formulário corretamente
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      deviceId: "",
      checked: false,
    },
    mode: "all", // Permite que a validação ocorra em tempo real
  });

  const { handleSubmit, formState, watch, setValue, trigger } = form;

  // Verifica se o deviceId é válido
  const isDeviceValid =
    !formState.errors.deviceId && watch("deviceId").length === 6;

  const handleConnectionResult = useCallback(
    (success) => {
      console.log(success);
      setValue("checked", success);
      trigger();
    },
    [setValue, trigger],
  );

  useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "deviceId" && value.checked === true) {
        handleConnectionResult(false); // Define como false se o ID for alterado
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, handleConnectionResult]); // Dispara sempre que o deviceId mudar

  // Manipulador de envio do formulário
  async function onSubmit(values) {
    console.log(values);
    const response = await fetch("/api/v1/devices", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chip_id: values.deviceId }),
    });

    const newDevice = await response.json();

    // Opcional: Resetar formulário após sucesso
    form.reset();
    return newDevice;
  }

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control} // Mantendo a referência ao form.control
          name="deviceId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>ID dispositivo</FormLabel>
              <FormControl>
                <Input placeholder="ID do dispositivo" {...field} />
              </FormControl>
              <FormDescription>
                Este é um ID único do seu dispositivo que não pode ser alterado.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div
          className={`transition-opacity duration-500 ${isDeviceValid ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none"}`}
        >
          {isDeviceValid && (
            <div className="flex justify-center items-center animate-fade-in">
              <DeviceConnectionPanel
                deviceId={watch("deviceId")}
                onConnectionResult={handleConnectionResult}
              />
            </div>
          )}
        </div>
        <SheetFooter>
          <SheetClose asChild>
            <Button type="submit" disabled={!formState.isValid}>
              Adicionar
            </Button>
          </SheetClose>
        </SheetFooter>
      </form>
    </Form>
  );
}
