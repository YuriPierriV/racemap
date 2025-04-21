import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { DeviceForm } from "./_form";
import { useMediaQuery } from "react-responsive";
import { Separator } from "@/components/ui/separator";

export default function AddNewDevice({ text, Button: CustomButton }) {
  const isMobile = useMediaQuery({ maxWidth: 768 });
  return (
    <div className="">
      <Sheet>
        <SheetTrigger asChild>
          {CustomButton ? (
            <CustomButton>{text}</CustomButton> // Renderiza o botão customizado
          ) : (
            <button className="px-4 py-2 bg-blue-500 text-white rounded">
              {text}
            </button> // Renderiza um botão padrão caso não tenha sido passado um botão
          )}
        </SheetTrigger>
        <SheetContent side={isMobile ? "bottom" : "right"}>
          <SheetHeader>
            <SheetTitle>Novo Dispositivo</SheetTitle>
            <SheetDescription>
              Adicione um dispositivo para integrá-lo ao sistema e começar a
              monitorar sua localização e dados.
            </SheetDescription>
          </SheetHeader>
          <Separator className="my-5" />
          <div className="">
            <DeviceForm />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
