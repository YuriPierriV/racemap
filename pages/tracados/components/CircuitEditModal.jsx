import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X, Save, Loader2 } from "lucide-react";
import MapEditablePreview from "./MapEditablePreview";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
} from "@/components/ui/alert-dialog";

const CircuitEditModal = ({ circuit, isOpen, onClose, onSave }) => {
  const [editData, setEditData] = useState({
    nome: "",
    descricao: "",
    direcao: "clockwise",
    pontos: [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [mapKey, setMapKey] = useState(0);

  useEffect(() => {
    if (circuit && isOpen) {
      console.log("CircuitEditModal - Carregando circuito:", circuit.nome);
      console.log(
        "CircuitEditModal - Total de pontos:",
        circuit.pontos?.length,
      );
      console.log("CircuitEditModal - Primeiro ponto:", circuit.pontos?.[0]);

      setEditData({
        nome: circuit.nome || "",
        descricao: circuit.descricao || "",
        direcao: circuit.direcao || "clockwise",
        pontos: circuit.pontos || [],
      });
      // Incrementar key para forçar recriação do mapa
      setMapKey((prev) => prev + 1);
    }
  }, [circuit, isOpen]);

  if (!circuit) return null;

  const handleSave = async () => {
    try {
      setIsSaving(true);
      console.log(
        "CircuitEditModal - Salvando alterações do circuito:",
        circuit.id,
      );
      console.log("CircuitEditModal - Dados editados:", {
        nome: editData.nome,
        descricao: editData.descricao,
        direcao: editData.direcao,
        totalPontos: editData.pontos.length,
        primeiroPonto: editData.pontos[0],
      });

      await onSave(circuit.id, editData);
      onClose();
    } catch (error) {
      console.error("CircuitEditModal - Erro ao salvar:", error);
      alert(
        "Erro ao salvar as alterações. Verifique o console para mais detalhes.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleDirectionChange = (value) => {
    if (value !== editData.direcao) {
      const reversedPoints = [...editData.pontos].reverse();
      setEditData((prev) => ({
        ...prev,
        direcao: value,
        pontos: reversedPoints,
      }));
      setMapKey((prev) => prev + 1);
    }
  };

  const handleStartPositionChange = (lat, lng, closestIndex) => {
    if (closestIndex !== undefined && closestIndex !== 0) {
      const reorderedPoints = [
        ...editData.pontos.slice(closestIndex),
        ...editData.pontos.slice(0, closestIndex),
      ];
      setEditData((prev) => ({
        ...prev,
        pontos: reorderedPoints,
      }));
      setMapKey((prev) => prev + 1);
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <AlertDialogHeader>
          <div className="flex items-center justify-between">
            <AlertDialogTitle className="text-2xl font-bold">
              Editar Circuito
            </AlertDialogTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8"
              disabled={isSaving}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
          <AlertDialogDescription className="sr-only">
            Modal para editar as informações do circuito, incluindo nome,
            descrição, direção e ponto de largada através do mapa interativo.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="space-y-6">
          {/* Preview do Mapa */}
          {editData.pontos.length > 0 && (
            <div>
              <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                Visualização do Traçado
                <span className="text-xs ml-2 text-muted-foreground">
                  (Arraste a bandeira 🏁 para escolher o ponto de largada)
                </span>
              </h3>
              <div className="border rounded-lg overflow-hidden">
                {editData.pontos && editData.pontos.length > 0 ? (
                  <MapEditablePreview
                    key={`circuit-edit-${mapKey}`}
                    points={editData.pontos}
                    direction={editData.direcao}
                    className="h-96 w-full"
                    onStartPositionChange={handleStartPositionChange}
                  />
                ) : (
                  <div className="h-96 w-full flex items-center justify-center bg-muted">
                    <p className="text-sm text-muted-foreground">
                      Carregando pontos...
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          <Separator />

          {/* Editar Informações */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name" className="text-base">
                Nome do Traçado *
              </Label>
              <Input
                id="edit-name"
                value={editData.nome}
                onChange={(e) =>
                  setEditData((prev) => ({ ...prev, nome: e.target.value }))
                }
                placeholder="Nome do traçado"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-description" className="text-base">
                Descrição
              </Label>
              <Input
                id="edit-description"
                value={editData.descricao}
                onChange={(e) =>
                  setEditData((prev) => ({
                    ...prev,
                    descricao: e.target.value,
                  }))
                }
                placeholder="Descrição do circuito"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="edit-direction" className="text-base">
                Direção do Traçado *
              </Label>
              <Select
                value={editData.direcao}
                onValueChange={handleDirectionChange}
              >
                <SelectTrigger id="edit-direction" className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="clockwise">↻ Sentido Horário</SelectItem>
                  <SelectItem value="counterclockwise">
                    ↺ Sentido Anti-horário
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Inverter a direção reordena os pontos e inverte as setas no mapa
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Ponto Inicial (Latitude):
                </span>
                <p className="text-base font-medium mt-1 font-mono">
                  {editData.pontos.length > 0 ? editData.pontos[0].lat : "-"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Ponto Inicial (Longitude):
                </span>
                <p className="text-base font-medium mt-1 font-mono">
                  {editData.pontos.length > 0 ? editData.pontos[0].lng : "-"}
                </p>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Tipo:
                </span>
                <p className="text-base font-medium mt-1">
                  🔄 Circuito Fechado
                </p>
              </div>
              <div>
                <span className="font-semibold text-sm text-muted-foreground">
                  Total de Pontos:
                </span>
                <p className="text-base font-medium mt-1">
                  {editData.pontos.length} pontos
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Botões de Ação */}
          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" onClick={onClose} disabled={isSaving}>
              Cancelar
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving || !editData.nome.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar Alterações
                </>
              )}
            </Button>
          </div>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default CircuitEditModal;
