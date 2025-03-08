
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";



export default function Tracados({ defaultOpen }) {


    return (
        <LayoutMainPainel>
            <Card>
                <CardHeader>
                    <CardTitle>Tracados</CardTitle>
                    <CardDescription>Descrição da Tracados</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Tracados</p>
                </CardContent>
                <CardFooter>
                    <p>Tracados Footer</p>
                </CardFooter>
            </Card>
        </LayoutMainPainel>
    )
}
