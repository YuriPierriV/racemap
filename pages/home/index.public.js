import { Layout } from "pages/components/app-sidebar";
import Header from "pages/components/Header";



export async function getServerSideProps(context) {
    const cookies = context.req.cookies || {}; // Pega os cookies do request
    const defaultOpen = cookies["sidebar_state"] === "true";

    return {
        props: { defaultOpen },
    };
}

export default function Home({ defaultOpen }) {


    return (
        <Layout defaultOpen={defaultOpen}>
            <Header></Header>

        </Layout>
    )
}
