import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";

export default function MapaDeCircuitos() {
  return (
    <LayoutMainPainel>
      <Card>
        <CardHeader>
          <CardTitle>Lista De Pilotos</CardTitle>
          <CardDescription>Descrição da MapaDeCircuitos</CardDescription>
        </CardHeader>
        <CardContent>
          <p>MapaDeCircuitos</p>
        </CardContent>
        <CardFooter>
          <p>MapaDeCircuitos Footer</p>
        </CardFooter>
      </Card>
    </LayoutMainPainel>
  );
}
