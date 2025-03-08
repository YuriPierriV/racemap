import { LayoutAside } from "pages/components/app-sidebar";
import Header from "pages/components/Header";



export async function getServerSideProps(context) {
    const cookies = context.req.cookies || {}; // Pega os cookies do request
    const defaultOpen = cookies["sidebar_state"] === "true";

    return {
        props: { defaultOpen },
    };
}

export default function LayoutMainPainel({ defaultOpen,children }) {


    return (
        <LayoutAside defaultOpen={defaultOpen}>
            <Header></Header>
            <section id="main" className="container mx-auto space-y-5 space-x-5" >
                {children}
            </section>
        </LayoutAside>
    )
}
