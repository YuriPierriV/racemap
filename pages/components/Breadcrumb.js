import { useRouter } from "next/router";
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function BreadcrumbDinamic() {
    const router = useRouter();
    const pathSegments = router.pathname.split("/").filter(Boolean);

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem>
                    <BreadcrumbLink href="racemap.com.br" className="capitalize">
                        Racemap
                    </BreadcrumbLink>
                </BreadcrumbItem>

                {pathSegments.map((segment, index) => {
                    const href = "/" + pathSegments.slice(0, index + 1).join("/");
                    return (
                        <>
                            <BreadcrumbSeparator key={`sep-${index}`} />
                            <BreadcrumbItem key={index}>
                                <BreadcrumbLink href={href} className="capitalize">
                                    {segment.replace(/-/g, " ")}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                        </>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
