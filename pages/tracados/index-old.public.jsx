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
} from "lucide-react";
import { useRouter } from "next/router";
import MapPositioning from "./components/MapPositioning";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

async function fetchAPI(key) {
  const response = await fetch(key);
  const responseBody = await response.json();
  return responseBody;
}

export default function Tracados() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [gpsTestStatus, setGpsTestStatus] = useState("idle"); // idle, testing, connected, failed
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    location: "",
    length: "",
    device: "",
    centerLat: "",
    centerlong: "",
    trackingStatus: "ready",
    points: [],
  });

  // Buscar dispositivos da API
  const {
    data: devices,
    error: devicesError,
    isLoading: devicesLoading,
  } = useSWR("/api/v1/devices", fetchAPI, {
    refreshInterval: 5000, // Atualiza a cada 5 segundos
  });

  // Hook de status GPS - só inicializa se um dispositivo foi selecionado
  const selectedDevice = devices?.find((d) => d.id === formData.device);
  const { gpsStatus, handleCheckGpsStatus } = useGpsStatus(
    selectedDevice?.chip_id || null,
  );

  // Testar conexão quando um dispositivo é selecionado
  useEffect(() => {
    if (formData.device && selectedDevice) {
      setGpsTestStatus("testing");
      handleCheckGpsStatus();
    }
  }, [formData.device, selectedDevice, handleCheckGpsStatus]);

  // Monitorar mudanças no status do GPS
  useEffect(() => {
    if (gpsTestStatus === "testing") {
      if (gpsStatus === "Conectado") {
        setGpsTestStatus("connected");
      } else if (gpsStatus === "Desconectado") {
        setGpsTestStatus("failed");
      }
    }
  }, [gpsStatus, gpsTestStatus]);

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
      title: "Posicionar no Centro",
      description: "Posicione-se no centro do traçado",
      icon: MapPin,
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

  const handleSubmit = () => {
    console.log("Dados do traçado:", formData);
    // Aqui você fará a chamada para a API
    setOpen(false);
    resetForm();
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
      centerLat: "",
      centerlong: "",
      trackingStatus: "ready",
      points: [],
    });
  };

  const handleCancel = () => {
    setOpen(false);
    resetForm();
  };

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Resetar status do GPS ao mudar de dispositivo
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
        return formData.centerLat !== "" && formData.centerlong !== "";
      case 3:
        return formData.points.length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  return (
    <LayoutMainPainel>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Traçados</h1>
          <AlertDialogTrigger asChild>
            <Button size="lg">+ Adicionar Novo Traçado</Button>
          </AlertDialogTrigger>
        </div>

        <AlertDialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
          <div className="px-6 pt-6">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-2xl">
                {steps[currentStep].title}
              </AlertDialogTitle>
              <AlertDialogDescription>
                {steps[currentStep].description}
              </AlertDialogDescription>
            </AlertDialogHeader>

            {/* Progress Steps */}
            <div className="flex justify-between mb-5 px-4 mt-4">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                const isCompleted = index < currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div
                    key={index}
                    className="flex flex-col items-center flex-1"
                  >
                    <div
                      className={`
                    w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all
                    ${
                      isCompleted
                        ? "bg-green-500 text-white"
                        : isCurrent
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground"
                    }
                  `}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5" />
                      ) : (
                        <StepIcon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center ${isCurrent ? "font-semibold" : ""}`}
                    >
                      {step.title.split(" ")[0]}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step Content - Scrollable */}
          <div className="flex-1 overflow-y-auto px-6 py-4">
            <div className="min-h-[300px]">
              {currentStep === 0 && (
                <div className="space-y-4">
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
                    <Label htmlFor="location" className="text-base">
                      Localização
                    </Label>
                    <Input
                      id="location"
                      placeholder="Ex: São Paulo, Brasil"
                      value={formData.location}
                      onChange={(e) =>
                        updateFormData("location", e.target.value)
                      }
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="length" className="text-base">
                      Comprimento Aproximado (metros)
                    </Label>
                    <Input
                      id="length"
                      type="number"
                      placeholder="Ex: 4309"
                      value={formData.length}
                      onChange={(e) => updateFormData("length", e.target.value)}
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
                      className="mt-2 min-h-[100px]"
                    />
                  </div>
                </div>
              )}

              {currentStep === 1 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Dispositivo GPS</CardTitle>
                      <CardDescription>
                        Selecione o dispositivo que será usado para capturar o
                        traçado
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {devicesLoading ? (
                        <div className="text-center py-8">
                          <p className="text-muted-foreground">
                            Carregando dispositivos...
                          </p>
                        </div>
                      ) : devicesError ? (
                        <div className="text-center py-8">
                          <p className="text-red-500">
                            Erro ao carregar dispositivos
                          </p>
                        </div>
                      ) : !devices || devices.length === 0 ? (
                        <div className="text-center py-8 space-y-4">
                          <div className="flex flex-col items-center gap-3">
                            <Radio className="w-16 h-16 text-muted-foreground" />
                            <div>
                              <p className="font-semibold text-lg">
                                Nenhum dispositivo cadastrado
                              </p>
                              <p className="text-sm text-muted-foreground">
                                Cadastre um dispositivo para começar a rastrear
                                traçados
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
                        </div>
                      ) : (
                        <>
                          <Select
                            value={formData.device}
                            onValueChange={(value) =>
                              updateFormData("device", value)
                            }
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Selecione um dispositivo" />
                            </SelectTrigger>
                            <SelectContent>
                              {devices.map((device) => (
                                <SelectItem key={device.id} value={device.id}>
                                  {device.name ||
                                    `Dispositivo #${device.chip_id}`}
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
                              className="text-xs"
                            >
                              <ExternalLink className="w-3 h-3 mr-1" />
                              Gerenciar dispositivos
                            </Button>
                          </div>
                        </>
                      )}
                    </CardContent>
                  </Card>

                  {/* Card de Status do Teste GPS */}
                  {formData.device && devices && devices.length > 0 && (
                    <>
                      {gpsTestStatus === "testing" && (
                        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
                          <CardContent className="pt-6">
                            <div className="flex items-start gap-3">
                              <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin mt-0.5" />
                              <div className="text-sm text-blue-800 dark:text-blue-200">
                                <p className="font-semibold mb-1">
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
                              <Wifi className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                              <div className="text-sm text-green-800 dark:text-green-200">
                                <p className="font-semibold mb-1">
                                  ✓ GPS Conectado!
                                </p>
                                <p>
                                  O dispositivo está online e pronto para uso.
                                  Você pode avançar para a próxima etapa.
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
                                <WifiOff className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
                                <div className="text-sm text-red-800 dark:text-red-200 flex-1">
                                  <p className="font-semibold mb-1">
                                    ✗ Falha na Conexão
                                  </p>
                                  <p>
                                    Não foi possível conectar ao GPS. Verifique
                                    se o dispositivo está ligado e tente
                                    novamente.
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
              )}

              {currentStep === 2 && (
                <MapPositioning
                  selectedDevice={selectedDevice}
                  centerLat={formData.centerLat}
                  centerlong={formData.centerlong}
                  onUpdatePosition={(lat, long) => {
                    updateFormData("centerLat", lat);
                    updateFormData("centerlong", long);
                  }}
                />
              )}

              {currentStep === 3 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Rastreamento em Andamento</CardTitle>
                      <CardDescription>
                        Percorra todo o traçado do circuito
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-center py-8">
                        <div className="text-center space-y-4">
                          <div className="relative">
                            <Circle className="w-24 h-24 text-primary animate-pulse mx-auto" />
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-2xl font-bold">
                                {formData.points.length}
                              </span>
                            </div>
                          </div>
                          <p className="text-lg font-semibold">
                            Pontos capturados
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Continue percorrendo o traçado...
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <Button
                          variant={
                            formData.trackingStatus === "tracking"
                              ? "destructive"
                              : "default"
                          }
                          className="w-full"
                          onClick={() => {
                            if (formData.trackingStatus === "tracking") {
                              updateFormData("trackingStatus", "paused");
                            } else {
                              updateFormData("trackingStatus", "tracking");
                              // Simular adição de pontos
                              setTimeout(
                                () =>
                                  updateFormData("points", [
                                    ...formData.points,
                                    { lat: -23.5505, long: -46.6333 },
                                  ]),
                                1000,
                              );
                            }
                          }}
                        >
                          {formData.trackingStatus === "tracking"
                            ? "⏸️ Pausar"
                            : "▶️ Iniciar Rastreamento"}
                        </Button>

                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            updateFormData("trackingStatus", "ready");
                            updateFormData("points", []);
                          }}
                        >
                          🔄 Recomeçar
                        </Button>
                      </div>

                      <Card className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800">
                        <CardContent className="pt-6">
                          <div className="flex items-start gap-3">
                            <Info className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                            <div className="text-sm text-yellow-800 dark:text-yellow-200">
                              <p className="font-semibold mb-1">Importante:</p>
                              <p>
                                Mantenha velocidade constante e tente completar
                                uma volta completa para melhor precisão.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CardContent>
                  </Card>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>Revisão Final</CardTitle>
                      <CardDescription>
                        Confira os dados antes de salvar
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                        <div>
                          <span className="font-semibold">Nome:</span>
                          <p className="text-muted-foreground">
                            {formData.name || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">Localização:</span>
                          <p className="text-muted-foreground">
                            {formData.location || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">Comprimento:</span>
                          <p className="text-muted-foreground">
                            {formData.length ? `${formData.length}m` : "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">Dispositivo:</span>
                          <p className="text-muted-foreground">
                            {formData.device || "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">Ponto Central:</span>
                          <p className="text-muted-foreground">
                            {formData.centerLat && formData.centerlong
                              ? `${formData.centerLat}, ${formData.centerlong}`
                              : "-"}
                          </p>
                        </div>
                        <div>
                          <span className="font-semibold">
                            Pontos Capturados:
                          </span>
                          <p className="text-muted-foreground">
                            {formData.points.length}
                          </p>
                        </div>
                      </div>

                      {formData.description && (
                        <div className="pt-2 border-t">
                          <span className="font-semibold text-sm">
                            Descrição:
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {formData.description}
                          </p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-3">
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div className="text-sm text-green-800 dark:text-green-200">
                          <p className="font-semibold mb-1">Tudo pronto!</p>
                          <p>
                            Clique em &quot;Finalizar Cadastro&quot; para salvar
                            o traçado.
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}
            </div>
          </div>

          {/* Footer fixo */}
          <div className="border-t px-6 py-4 bg-background rounded-b-lg">
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel onClick={handleCancel}>
                Cancelar
              </AlertDialogCancel>

              {currentStep > 0 && (
                <Button variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button onClick={handleNext} disabled={!isStepValid()}>
                  Próximo
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={!isStepValid()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Finalizar Cadastro
                </Button>
              )}
            </AlertDialogFooter>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </LayoutMainPainel>
  );
}
