import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";

export default function Pilotos() {
  return (
    <LayoutMainPainel>
      <Card>
        <CardHeader>
          <CardTitle>Pilotos</CardTitle>
          <CardDescription>Descrição da Pilotos</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Pilotos</p>
        </CardContent>
        <CardFooter>
          <p>Pilotos Footer</p>
        </CardFooter>
      </Card>
    </LayoutMainPainel>
  );
}
