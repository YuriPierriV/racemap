import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";
import AddNewDevice from "./_add-new-device";

export default function ListaDeDispositivos({ defaultOpen }) {
  return (
    <LayoutMainPainel>
      <Card>
        <AddNewDevice></AddNewDevice>
      </Card>
    </LayoutMainPainel>
  );
}
