import { useState, useEffect } from "react";
import LayoutMainPainel from "pages/components/main-painel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import useSWR from "swr";
import { useGpsStatus } from "pages/comunication/StatusGps";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  CheckCircle2,
  Circle,
  Info,
  MapPin,
  Radio,
  Settings,
  ChevronLeft,
  ChevronRight,
  Plus,
  ExternalLink,
  Loader2,
  WifiOff,
  Wifi,
  X,
} from "lucide-react";
import { useRouter } from "next/router";
import TrackRecording from "./components/TrackRecording";
import CircuitCard from "./components/CircuitCard";
import CircuitDetailModal from "./components/CircuitDetailModal";
import CircuitEditModal from "./components/CircuitEditModal";
import MapPreviewClean from "./components/MapPreviewClean";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function Tracados() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [gpsTestStatus, setGpsTestStatus] = useState("idle");
  const [selectedCircuit, setSelectedCircuit] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    length: "",
    device: "",
    startLat: "", // Ponto inicial do traçado
    startLong: "", // Ponto inicial do traçado
    direction: "clockwise", // Direção do circuito
    trackingStatus: "ready",
    points: [], // Pontos capturados durante o rastreamento
    trackBuffer: [], // Buffer para média dos pontos
  });

  const {
    data: devices,
    error: devicesError,
    isLoading: devicesLoading,
  } = useSWR("/api/v1/devices", fetchAPI, {
    refreshInterval: 5000,
  });

  const {
    data: circuits,
    error: circuitsError,
    isLoading: circuitsLoading,
    mutate: mutateCircuits,
  } = useSWR("/api/v1/circuits", fetchAPI, {
    refreshInterval: 10000,
  });

  const selectedDevice = devices?.find((d) => d.id === formData.device);
  const { gpsStatus, handleCheckGpsStatus } = useGpsStatus(
    selectedDevice?.chip_id || null,
  );

  useEffect(() => {
    if (formData.device && selectedDevice) {
      setGpsTestStatus("testing");
      handleCheckGpsStatus();
    }
  }, [formData.device, selectedDevice, handleCheckGpsStatus]);

  useEffect(() => {
    if (gpsTestStatus === "testing") {
      if (gpsStatus === "Conectado") {
        setGpsTestStatus("connected");
      } else if (gpsStatus === "Desconectado") {
        setGpsTestStatus("failed");
      }
    }
  }, [gpsStatus, gpsTestStatus]);

  // Sincronizar startLat/startLong com o primeiro ponto sempre que os pontos mudarem
  useEffect(() => {
    if (formData.points.length > 0) {
      const firstPoint = formData.points[0];
      if (firstPoint.lat && firstPoint.lng) {
        if (
          formData.startLat !== firstPoint.lat.toString() ||
          formData.startLong !== firstPoint.lng.toString()
        ) {
          setFormData((prev) => ({
            ...prev,
            startLat: firstPoint.lat.toString(),
            startLong: firstPoint.lng.toString(),
          }));
        }
      }
    }
  }, [formData.points, formData.startLat, formData.startLong]);

  const steps = [
    {
      title: "Informações do Traçado",
      description: "Dados básicos sobre o circuito",
      icon: Info,
    },
    {
      title: "Selecionar Dispositivo",
      description: "Escolha o dispositivo GPS para rastreamento",
      icon: Radio,
    },
    {
      title: "Rastreamento",
      description: "Percorra o traçado para capturar os pontos",
      icon: Circle,
    },
    {
      title: "Ajustes Finais",
      description: "Revise e ajuste o traçado capturado",
      icon: Settings,
    },
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    try {
      // Pontos são salvos na ordem correta:
      // - points[0] é sempre o ponto inicial (largada - bandeira 🏁)
      // - points[points.length - 1] é sempre o ponto final
      // - Se direção invertida, os pontos já foram reordenados
      // Todos os circuitos são obrigatoriamente fechados (closed)
      const circuitData = {
        nome: formData.name,
        descricao: formData.description,
        tamanho_percurso: formData.length ? parseFloat(formData.length) : null,
        pontos: formData.points,
        direcao: formData.direction,
        tipo_circuito: "closed",
      };

      // Enviar para API
      const response = await fetch("/api/v1/circuits", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(circuitData),
      });

      if (!response.ok) {
        throw new Error("Erro ao salvar o circuito");
      }

      const result = await response.json();
      console.log("Circuito salvo com sucesso:", result);

      // Atualizar a lista de circuitos
      mutateCircuits();

      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error("Erro ao salvar circuito:", error);
      // Aqui você pode adicionar um toast de erro ou modal
    }
  };

  const handleViewCircuit = (circuit) => {
    setSelectedCircuit(circuit);
    setShowDetailModal(true);
  };

  const handleEditCircuit = (circuit) => {
    setSelectedCircuit(circuit);
    setShowEditModal(true);
  };

  const handleSaveEdit = async (circuitId, updatedData) => {
    try {
      console.log(
        "handleSaveEdit - Enviando atualização para circuito ID:",
        circuitId,
      );
      console.log("handleSaveEdit - Dados a serem enviados:", {
        nome: updatedData.nome,
        descricao: updatedData.descricao,
        direcao: updatedData.direcao,
        totalPontos: updatedData.pontos?.length,
      });

      // Garantir que tipo_circuito seja sempre 'closed'
      updatedData.tipo_circuito = "closed";

      const response = await fetch(`/api/v1/circuits/${circuitId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("handleSaveEdit - Erro na resposta:", result);
        throw new Error(result.message || "Erro ao atualizar circuito");
      }

      console.log(
        "handleSaveEdit - Circuito atualizado com sucesso:",
        result.id,
      );

      // Atualizar a lista de circuitos
      mutateCircuits();
      setShowEditModal(false);
      setSelectedCircuit(null);
    } catch (error) {
      console.error("handleSaveEdit - Erro:", error);
      throw error;
    }
  };

  const handleDeleteCircuit = async (circuit) => {
    if (
      confirm(`Tem certeza que deseja excluir o circuito "${circuit.nome}"?`)
    ) {
      try {
        const response = await fetch(`/api/v1/circuits/${circuit.id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erro ao excluir circuito");
        }

        // Atualizar a lista de circuitos
        mutateCircuits();
        console.log("Circuito excluído com sucesso");
      } catch (error) {
        console.error("Erro ao excluir circuito:", error);
        // Aqui você pode adicionar um toast de erro
      }
    }
  };

  const resetForm = () => {
    setCurrentStep(0);
    setGpsTestStatus("idle");
    setFormData({
      name: "",
      description: "",
      location: "",
      length: "",
      device: "",
      startLat: "",
      startLong: "",
      direction: "clockwise",
      trackingStatus: "ready",
      points: [],
      trackBuffer: [],
    });
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (field === "device") {
      setGpsTestStatus("idle");
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return formData.name.trim() !== "";
      case 1:
        return formData.device !== "" && gpsTestStatus === "connected";
      case 2:
        return formData.points.length > 0;
      case 3:
        return true;
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="min-x-100 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Básicos</CardTitle>
                <CardDescription>
                  Informações fundamentais sobre o traçado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-base">
                    Nome do Traçado *
                  </Label>
                  <Input
                    id="name"
                    placeholder="Ex: Autódromo Internacional de SP"
                    value={formData.name}
                    onChange={(e) => updateFormData("name", e.target.value)}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="description" className="text-base">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="Descreva características importantes do traçado..."
                    value={formData.description}
                    onChange={(e) =>
                      updateFormData("description", e.target.value)
                    }
                    className="mt-2 min-h-[120px]"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 1:
        return (
          <div className="min-x-100 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dispositivo GPS</CardTitle>
                <CardDescription>
                  Selecione o dispositivo que será usado para capturar o traçado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {devicesLoading ? (
                  <div className="text-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-primary" />
                    <p className="text-muted-foreground">
                      Carregando dispositivos...
                    </p>
                  </div>
                ) : devicesError ? (
                  <div className="text-center py-12">
                    <p className="text-red-500">
                      Erro ao carregar dispositivos
                    </p>
                  </div>
                ) : !devices || devices.length === 0 ? (
                  <div className="text-center py-12 space-y-4">
                    <Radio className="w-20 h-20 text-muted-foreground mx-auto" />
                    <div>
                      <p className="font-semibold text-xl mb-2">
                        Nenhum dispositivo cadastrado
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Cadastre um dispositivo para começar a rastrear traçados
                      </p>
                    </div>
                    <Button
                      size="lg"
                      onClick={() => router.push("/dispositivos")}
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Ir para Dispositivos
                    </Button>
                  </div>
                ) : (
                  <>
                    <Select
                      value={formData.device}
                      onValueChange={(value) => updateFormData("device", value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Selecione um dispositivo" />
                      </SelectTrigger>
                      <SelectContent>
                        {devices.map((device) => (
                          <SelectItem key={device.id} value={device.id}>
                            {device.name || `Dispositivo #${device.chip_id}`}
                            {device.status === "online" && " 🟢"}
                            {device.status === "offline" && " 🔴"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex justify-end">
                      <Button
                        variant="link"
                        size="sm"
                        onClick={() => router.push("/dispositivos")}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Gerenciar dispositivos
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {formData.device && devices && devices.length > 0 && (
              <>
                {gpsTestStatus === "testing" && (
                  <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Loader2 className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin mt-0.5" />
                        <div className="text-sm text-blue-800 dark:text-blue-200">
                          <p className="font-semibold text-base mb-1">
                            Testando conexão GPS...
                          </p>
                          <p>
                            Aguarde enquanto verificamos a conexão com o
                            dispositivo.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {gpsTestStatus === "connected" && (
                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <Wifi className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="text-sm text-green-800 dark:text-green-200">
                          <p className="font-semibold text-base mb-1">
                            ✓ GPS Conectado!
                          </p>
                          <p>
                            O dispositivo está online e pronto para uso. Você
                            pode avançar para a próxima etapa.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                {gpsTestStatus === "failed" && (
                  <Card className="bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800">
                    <CardContent className="pt-6">
                      <div className="flex flex-col gap-3">
                        <div className="flex items-start gap-3">
                          <WifiOff className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5" />
                          <div className="text-sm text-red-800 dark:text-red-200 flex-1">
                            <p className="font-semibold text-base mb-1">
                              ✗ Falha na Conexão
                            </p>
                            <p>
                              Não foi possível conectar ao GPS. Verifique se o
                              dispositivo está ligado e tente novamente.
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setGpsTestStatus("testing");
                            handleCheckGpsStatus();
                          }}
                          className="w-full border-red-300 dark:border-red-700"
                        >
                          🔄 Tentar Novamente
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        );

      case 2:
        return (
          <TrackRecording
            selectedDevice={selectedDevice}
            startLat={formData.startLat}
            startLong={formData.startLong}
            points={formData.points}
            trackingStatus={formData.trackingStatus}
            onUpdatePoints={(points) => updateFormData("points", points)}
            onUpdateTrackingStatus={(status) =>
              updateFormData("trackingStatus", status)
            }
            onUpdateStartPosition={(lat, long) => {
              updateFormData("startLat", lat);
              updateFormData("startLong", long);
            }}
            onNext={handleNext}
          />
        );

      case 3:
        return (
          <div className="min-x-100 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Revisão Final</CardTitle>
                <CardDescription>
                  Confira os dados e visualize o traçado antes de salvar
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Preview do Mapa */}
                {formData.points.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-sm text-muted-foreground mb-3">
                      Visualização do Traçado
                      <span className="text-xs ml-2 text-muted-foreground">
                        (Arraste a bandeira 🏁 para escolher o ponto de largada)
                      </span>
                    </h3>
                    <MapPreviewClean
                      points={formData.points.map((point, index) => ({
                        ...point,
                        index,
                      }))}
                      direction={formData.direction}
                      className="h-96 w-full"
                      showCurrentPosition={false}
                      onStartPositionChange={(lat, lng, closestIndex) => {
                        // Reorganizar o array de pontos começando pelo índice escolhido
                        if (closestIndex !== undefined && closestIndex !== 0) {
                          const reorderedPoints = [
                            ...formData.points.slice(closestIndex),
                            ...formData.points.slice(0, closestIndex),
                          ];
                          setFormData((prev) => ({
                            ...prev,
                            points: reorderedPoints,
                            startLat: lat.toString(),
                            startLong: lng.toString(),
                          }));
                        } else {
                          updateFormData("startLat", lat.toString());
                          updateFormData("startLong", lng.toString());
                        }
                      }}
                    />
                  </div>
                )}

                <Separator />

                {/* Editar Informações do Traçado */}
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="review-name" className="text-base">
                      Nome do Traçado *
                    </Label>
                    <Input
                      id="review-name"
                      value={formData.name}
                      onChange={(e) => updateFormData("name", e.target.value)}
                      placeholder="Nome do traçado"
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="review-direction" className="text-base">
                      Direção do Traçado *
                    </Label>
                    <Select
                      value={formData.direction}
                      onValueChange={(value) => {
                        // Inverter os pontos ao trocar a direção
                        if (value !== formData.direction) {
                          const reversedPoints = [...formData.points].reverse();
                          setFormData((prev) => ({
                            ...prev,
                            direction: value,
                            points: reversedPoints,
                            startLat: reversedPoints[0].lat.toString(),
                            startLong: reversedPoints[0].lng.toString(),
                          }));
                        }
                      }}
                    >
                      <SelectTrigger id="review-direction" className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="clockwise">
                          ↻ Sentido Horário
                        </SelectItem>
                        <SelectItem value="counterclockwise">
                          ↺ Sentido Anti-horário
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground mt-1">
                      Inverter a direção reordena os pontos automaticamente
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <span className="font-semibold text-sm text-muted-foreground">
                        Ponto Inicial (Latitude):
                      </span>
                      <p className="text-base font-medium mt-1 font-mono">
                        {formData.startLat || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Arraste a bandeira 🏁 no mapa para alterar
                      </p>
                    </div>
                    <div>
                      <span className="font-semibold text-sm text-muted-foreground">
                        Ponto Inicial (Longitude):
                      </span>
                      <p className="text-base font-medium mt-1 font-mono">
                        {formData.startLong || "-"}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Arraste a bandeira 🏁 no mapa para alterar
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
                  </div>

                  {formData.description && (
                    <div className="pt-4 border-t">
                      <span className="font-semibold text-sm text-muted-foreground">
                        Descrição:
                      </span>
                      <p className="text-base mt-2">{formData.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
              <CardContent className="pt-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-400 mt-0.5" />
                  <div className="text-sm text-green-800 dark:text-green-200">
                    <p className="font-semibold text-base mb-1">Tudo pronto!</p>
                    <p>
                      Clique em &quot;Finalizar Cadastro&quot; para salvar o
                      traçado.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <LayoutMainPainel>
      {!showForm ? (
        <div style={{ display: showDetailModal ? "none" : "block" }}>
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold">Traçados</h1>
              <p className="text-muted-foreground mt-1">
                Gerencie os circuitos cadastrados
              </p>
            </div>
            <Button size="lg" onClick={() => setShowForm(true)}>
              <Plus className="w-5 h-5 mr-2" />
              Adicionar Novo Traçado
            </Button>
          </div>

          {circuitsLoading ? (
            <Card>
              <CardContent className="py-20">
                <div className="text-center space-y-4">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
                  <p className="text-muted-foreground">
                    Carregando circuitos...
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : circuitsError ? (
            <Card>
              <CardContent className="py-20">
                <div className="text-center space-y-4">
                  <p className="text-red-500">Erro ao carregar circuitos</p>
                </div>
              </CardContent>
            </Card>
          ) : !circuits || circuits.length === 0 ? (
            <Card>
              <CardContent className="py-20">
                <div className="text-center space-y-4">
                  <MapPin className="w-20 h-20 text-muted-foreground mx-auto" />
                  <div>
                    <p className="font-semibold text-xl">
                      Nenhum circuito cadastrado
                    </p>
                    <p className="text-muted-foreground mt-2">
                      Comece adicionando seu primeiro circuito
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {circuits.map((circuit) => (
                <CircuitCard
                  key={circuit.id}
                  circuit={circuit}
                  onView={handleViewCircuit}
                  onEdit={handleEditCircuit}
                  onDelete={handleDeleteCircuit}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div>
          {/* Cabeçalho Responsivo */}
          <Card className="mb-6 border-2 shadow-md">
            <CardContent className="p-3 md:p-4">
              {/* Layout Mobile: Empilhado */}
              <div className="flex flex-col gap-4 md:hidden">
                {/* Linha 1: Botão Cancelar + Título + Badge */}
                <div className="flex items-start gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="hover:bg-muted flex-shrink-0 h-8 w-8"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-bold leading-tight truncate">
                      {steps[currentStep].title}
                    </h1>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {steps[currentStep].description}
                    </p>
                  </div>
                  <Badge variant="outline" className="text-xs flex-shrink-0">
                    {currentStep + 1}/{steps.length}
                  </Badge>
                </div>

                {/* Linha 2: Indicadores de Progresso */}
                <div className="flex items-center justify-center gap-1 px-2">
                  {steps.map((step, index) => {
                    const isCompleted = index < currentStep;
                    const isCurrent = index === currentStep;

                    return (
                      <div
                        key={index}
                        className={`h-2 rounded-full transition-all ${
                          isCompleted
                            ? "bg-green-500 w-6"
                            : isCurrent
                              ? "bg-primary w-8"
                              : "bg-muted w-6"
                        }`}
                      />
                    );
                  })}
                </div>

                {/* Linha 3: Botões de Navegação */}
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className="h-9 flex-1"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Voltar
                  </Button>

                  {currentStep < steps.length - 1 ? (
                    <Button
                      onClick={handleNext}
                      disabled={!isStepValid()}
                      size="sm"
                      className="h-9 flex-1"
                    >
                      Próximo
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  ) : (
                    <Button
                      onClick={handleSubmit}
                      disabled={!isStepValid()}
                      className="bg-green-600 hover:bg-green-700 h-9 flex-1"
                      size="sm"
                    >
                      <CheckCircle2 className="w-4 h-4 mr-1" />
                      Finalizar
                    </Button>
                  )}
                </div>

                {/* Barra de Progresso Mobile */}
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>

              {/* Layout Desktop: Horizontal */}
              <div className="hidden md:flex items-start justify-between gap-6">
                {/* Lado Esquerdo: Botão Cancelar + Título/Descrição */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleCancel}
                    className="hover:bg-muted flex-shrink-0 mt-1"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-xl lg:text-2xl font-bold truncate">
                      {steps[currentStep].title}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      {steps[currentStep].description}
                    </p>
                  </div>
                </div>

                {/* Lado Direito: Controles de Navegação */}
                <div className="flex flex-col items-end gap-3 flex-shrink-0">
                  {/* Badge de Etapa */}
                  <Badge variant="outline" className="text-xs">
                    Etapa {currentStep + 1} de {steps.length}
                  </Badge>

                  {/* Botões de Navegação */}
                  <div className="flex items-center gap-2">
                    {/* Botão Voltar */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBack}
                      disabled={currentStep === 0}
                      className="h-9"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span className="hidden lg:inline ml-1">Voltar</span>
                    </Button>

                    {/* Indicador Visual Compacto */}
                    <div className="flex items-center gap-1 px-2">
                      {steps.map((step, index) => {
                        const isCompleted = index < currentStep;
                        const isCurrent = index === currentStep;

                        return (
                          <div
                            key={index}
                            className={`w-2 h-2 rounded-full transition-all ${
                              isCompleted
                                ? "bg-green-500"
                                : isCurrent
                                  ? "bg-primary w-6"
                                  : "bg-muted"
                            }`}
                          />
                        );
                      })}
                    </div>

                    {/* Botão Próximo/Finalizar */}
                    {currentStep < steps.length - 1 ? (
                      <Button
                        onClick={handleNext}
                        disabled={!isStepValid()}
                        size="sm"
                        className="h-9"
                      >
                        <span className="hidden lg:inline mr-1">Próximo</span>
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmit}
                        disabled={!isStepValid()}
                        className="bg-green-600 hover:bg-green-700 h-9"
                        size="sm"
                      >
                        <CheckCircle2 className="w-4 h-4 mr-1" />
                        <span className="hidden lg:inline">Finalizar</span>
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Linha de Progresso Desktop */}
              <div className="mt-4 relative hidden md:block">
                <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-green-500 transition-all duration-500"
                    style={{
                      width: `${((currentStep + 1) / steps.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div
            className="min-h-[500px]"
            style={{ display: showDetailModal ? "none" : "block" }}
          >
            {renderStepContent()}
          </div>
        </div>
      )}

      {/* Modal de detalhes do circuito */}
      <CircuitDetailModal
        circuit={selectedCircuit}
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedCircuit(null);
        }}
      />

      {/* Modal de edição do circuito */}
      <CircuitEditModal
        circuit={selectedCircuit}
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setSelectedCircuit(null);
        }}
        onSave={handleSaveEdit}
      />
    </LayoutMainPainel>
  );
}
