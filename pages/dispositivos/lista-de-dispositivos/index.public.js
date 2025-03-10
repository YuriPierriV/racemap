import { Card } from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";
import AddNewDevice from "./_add-new-device";

export default function ListaDeDispositivos() {
  return (
    <LayoutMainPainel>
      <Card>
        <AddNewDevice></AddNewDevice>
      </Card>
    </LayoutMainPainel>
  );
}
