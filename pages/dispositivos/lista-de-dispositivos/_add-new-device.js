import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ProfileForm } from "./_form";

export default function AddNewDevice() {
  return (
    <AlertDialog>
      <AlertDialogTrigger>Open</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Novo Dispositivo</AlertDialogTitle>
          <AlertDialogDescription>
            Adicione um dispositivo para integrá-lo ao sistema e começar a
            monitorar sua localização e dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <ProfileForm></ProfileForm>
      </AlertDialogContent>
    </AlertDialog>
  );
}
