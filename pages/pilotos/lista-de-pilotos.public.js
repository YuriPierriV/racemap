import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";

export default function ListaDePilotos({ defaultOpen }) {
  return (
    <LayoutMainPainel>
      <Card>
        <CardHeader>
          <CardTitle>Lista De Pilotos</CardTitle>
          <CardDescription>Descrição da ListaDePilotos</CardDescription>
        </CardHeader>
        <CardContent>
          <p>ListaDePilotos</p>
        </CardContent>
        <CardFooter>
          <p>ListaDePilotos Footer</p>
        </CardFooter>
      </Card>
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
