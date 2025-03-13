import { Card } from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";
import AddNewDevice from "./_add-new-device";
import { Button } from "@/components/ui/button";

export default function ListaDeDispositivos() {
  return (
    <LayoutMainPainel>
      <Card>
        <AddNewDevice text={"Adicionar novo"} Button={Button}></AddNewDevice>
      </Card>
    </LayoutMainPainel>
  );
}
