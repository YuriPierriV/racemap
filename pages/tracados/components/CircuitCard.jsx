import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Navigation, 
  Eye
} from "lucide-react";
import MapPreview from './MapPreview';

const CircuitCard = ({ circuit, onView, onEdit, onDelete }) => {

  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg font-semibold truncate">
              {circuit.nome}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {circuit.descricao || "Sem descrição"}
            </CardDescription>
          </div>
          
          <Badge variant="outline" className="text-xs ml-3">
            {circuit.pontos?.length || 0} pontos
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Preview do mapa - Sempre visível */}
        {circuit.pontos && circuit.pontos.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Navigation className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-muted-foreground">Preview do Traçado</span>
            </div>
            <MapPreview
              key={`circuit-card-map-${circuit.id}`}
              points={circuit.pontos}
              direction={circuit.direcao}
              className="h-48 w-full"
              showDirection={true}
            />
          </div>
        )}

        {/* Ações */}
        <div className="flex items-center justify-between pt-3 border-t">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onView?.(circuit)}
              className="h-8"
            >
              <Eye className="w-4 h-4 mr-1" />
              Visualizar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit?.(circuit)}
              className="h-8"
            >
              Editar
            </Button>
          </div>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onDelete?.(circuit)}
            className="h-8"
          >
            Excluir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CircuitCard;
