import BreadcrumbDinamic from "./Breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";

import { ModeToggle } from "pages/components/ThemeToggle";
import { Separator } from "@/components/ui/separator";

export default function Header() {
  return (
    <header className="w-full h-auto flex justify-between  py-5">
      <div className="flex items-center h-auto space-x-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="h-4" />

        <BreadcrumbDinamic></BreadcrumbDinamic>
      </div>

      <div className="flex items-center px-5">
        <ModeToggle />
      </div>
    </header>
  );
}
