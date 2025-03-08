
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import LayoutMainPainel from "pages/components/main-painel";



export default function Home({ defaultOpen }) {


    return (
        <LayoutMainPainel>
            <Card>
                <CardHeader>
                    <CardTitle>Home</CardTitle>
                    <CardDescription>Descrição da home</CardDescription>
                </CardHeader>
                <CardContent>
                    <p>Home</p>
                </CardContent>
                <CardFooter>
                    <p>Home Footer</p>
                </CardFooter>
            </Card>
        </LayoutMainPainel>
    )
}
