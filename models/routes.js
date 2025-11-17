import {
  Home,
  Settings,
  Map,
  Users,
  Satellite,
  CalendarDays,
  BarChart,
} from "lucide-react";

// Menu items.
export const aside_pages = [
  {
    title: "Home",
    url: "/home",
    icon: Home,
  },
  {
    title: "Pilotos",
    icon: Users,
    url: "/pilotos",
    submenu: [
      { title: "Lista de Pilotos", url: "/pilotos/lista-de-pilotos" },
      { title: "Estatísticas", url: "/pilotos/estatisticas" },
      { title: "Comparação de Pilotos", url: "/pilotos/comparacao" },
    ],
  },
  {
    title: "Traçados",
    url: "/tracados",
    icon: Map,
    submenu: [
      { title: "Mapa de Circuitos", url: "/tracados/mapa-de-circuitos" },
      { title: "Criar Novo Traçado", url: "/tracados/criar-novo-tracado" },
      { title: "Análise de Traçados", url: "/tracados/analise-de-tracados" },
    ],
  },
  {
    title: "Dispositivos",
    url: "/dispositivos",
    icon: Satellite,
    submenu: [
      {
        title: "Lista de Dispositivos",
        url: "/dispositivos/lista-de-dispositivos",
      },
      {
        title: "Gerenciar Dispositivos",
        url: "/dispositivos/gerenciar-dispositivos",
      },
    ],
  },
  {
    title: "Calendário",
    url: "/calendario",
    icon: CalendarDays,
    submenu: [
      { title: "Próximas Corridas", url: "/calendario/proximas-corridas" },
      {
        title: "Histórico de Corridas",
        url: "/calendario/historico-de-corridas",
      },
      { title: "Criar Novo Evento", url: "/calendario/criar-novo-evento" },
    ],
  },
  {
    title: "Estatísticas",
    url: "/estatisticas",
    icon: BarChart,
    submenu: [
      { title: "Visão Geral", url: "/estatisticas" },
      {
        title: "Histórico de Tempos",
        url: "/estatisticas/historico-de-tempos",
      },
      {
        title: "Exportação de Dados",
        url: "/estatisticas/exportacao-de-dados",
      },
    ],
  },
  {
    title: "Configurações",
    url: "/configuracoes",
    icon: Settings,
    submenu: [
      { title: "Perfil do Usuário", url: "#" },
      { title: "Configuração da Corrida", url: "#" },
      { title: "Preferências do Sistema", url: "#" },
    ],
  },
];
