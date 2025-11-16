
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  MapPin,
  Route,
  Navigation,
  Calendar,
  Clock,
  RotateCcw,
  RotateCw,
  X,
  Download,
  Share
} from "lucide-react";
import MapPreview from './MapPreview';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

const CircuitDetailModal = ({ circuit, isOpen, onClose }) => {
  const [showFullMap, setShowFullMap] = useState(false);

  if (!circuit) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDirectionIcon = (direction) => {
    return direction === 'clockwise' ? RotateCw : RotateCcw;
  };

  const getDirectionColor = (direction) => {
    return direction === 'clockwise' ? 'text-blue-600' : 'text-red-600';
  };

  const getDirectionText = (direction) => {
    return direction === 'clockwise' ? 'Sentido Horário' : 'Sentido Anti-horário';
  };

  const DirectionIcon = getDirectionIcon(circuit.direcao);

  const handleExport = () => {
    // Implementar exportação do circuito
    console.log('Exportar circuito:', circuit);
  };

  const handleShare = () => {
    // Implementar compartilhamento
    console.log('Compartilhar circuito:', circuit);
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-2xl font-bold">
              {circuit.nome}
            </AlertDialogTitle> 
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Informações básicas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Comprimento</span>
              </div>
              <p className="text-lg font-semibold">
                {circuit.tamanho_percurso ? `${circuit.tamanho_percurso}m` : 'Não informado'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Pontos</span>
              </div>
              <p className="text-lg font-semibold">{circuit.pontos?.length || 0}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <DirectionIcon className={`w-4 h-4 ${getDirectionColor(circuit.direcao)}`} />
                <span className="text-sm font-medium text-muted-foreground">Direção</span>
              </div>
              <p className={`text-lg font-semibold ${getDirectionColor(circuit.direcao)}`}>
                {getDirectionText(circuit.direcao)}
              </p>
            </div>
          </div>

          {/* Descrição */}
          {circuit.descricao && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">Descrição</h3>
              <p className="text-muted-foreground leading-relaxed">
                {circuit.descricao}
              </p>
            </div>
          )}

          {/* Informações de data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Criado em</span>
              </div>
              <p className="font-medium">{formatDate(circuit.created_at)}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Atualizado em</span>
              </div>
              <p className="font-medium">{formatDate(circuit.updated_at)}</p>
            </div>
          </div>

          {/* Mapa */}
          {circuit.pontos && circuit.pontos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Visualização do Traçado</h3>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowFullMap(!showFullMap)}
                  >
                    {showFullMap ? 'Mapa Pequeno' : 'Mapa Grande'}
                  </Button>
                </div>
              </div>

              <MapPreview
                key={`circuit-modal-map-${circuit.id}-${showFullMap ? 'full' : 'small'}`}
                points={circuit.pontos}
                direction={circuit.direcao}
                className={showFullMap ? "h-96 w-full" : "h-64 w-full"}
                showDirection={true}
              />
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleExport}
                className="flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </Button>

              <Button
                variant="outline"
                onClick={handleShare}
                className="flex items-center gap-2"
              >
                <Share className="w-4 h-4" />
                Compartilhar
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {circuit.pontos?.length || 0} pontos
              </Badge>
              <Badge variant={circuit.direcao === 'clockwise' ? 'default' : 'destructive'}>
                {getDirectionText(circuit.direcao)}
              </Badge>
            </div>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CircuitDetailModal;
