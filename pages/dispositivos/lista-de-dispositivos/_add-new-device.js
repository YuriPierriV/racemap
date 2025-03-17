import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { DeviceForm } from "./_form";

export default function AddNewDevice({ text, Button: CustomButton }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {CustomButton ? (
          <CustomButton>{text}</CustomButton> // Renderiza o botão customizado
        ) : (
          <button className="px-4 py-2 bg-blue-500 text-white rounded">
            {text}
          </button> // Renderiza um botão padrão caso não tenha sido passado um botão
        )}
      </AlertDialogTrigger>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Novo Dispositivo</AlertDialogTitle>
          <AlertDialogDescription>
            Adicione um dispositivo para integrá-lo ao sistema e começar a
            monitorar sua localização e dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <DeviceForm />
      </AlertDialogContent>
    </AlertDialog>
  );
}
