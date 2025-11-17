import { Card, CardHeader } from "@/components/ui/card";
import { Plus } from "lucide-react";
import AddNewDevice from "./_add-new-device";

export default function AddDeviceCard() {
  return (
    <AddNewDevice
      text=""
      Button={({ ...props }) => (
        <Card
          className="cursor-pointer hover:border-primary hover:shadow-lg transition-all duration-200 border-2 border-dashed flex items-center justify-center min-h-[200px]"
          {...props}
        >
          <CardHeader className="flex flex-col items-center justify-center text-center space-y-4 p-6">
            <div className="rounded-full bg-primary/10 p-4">
              <Plus className="w-8 h-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Adicionar Dispositivo</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Clique para cadastrar um novo dispositivo GPS
              </p>
            </div>
          </CardHeader>
        </Card>
      )}
    />
  );
}
