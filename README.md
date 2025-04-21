# RaceMap 🏁

*[README in English](README.en.md)*

[![Versão](https://img.shields.io/badge/versão-1.0.0-blue.svg)](https://github.com/YuriPierriV/racemap)
[![Licença](https://img.shields.io/badge/licença-MIT-green.svg)](LICENSE)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

Um sistema de mapeamento de corridas em tempo real que combina uma interface web moderna com dispositivos IoT para fornecer rastreamento e análise ao vivo de eventos de corrida. O RaceMap utiliza dispositivos GPS baseados em ESP8266 para transmitir dados de localização em tempo real para uma aplicação web Next.js, permitindo rastreamento preciso, visualização e análise de desempenho nas corridas.

<div align="center">
  <img src="public/logo_dark.png" alt="RaceMap Logo" width="300"/>
</div>

## Visão Geral

RaceMap é uma solução completa de gerenciamento e rastreamento de corridas que permite:
- Rastreamento GPS em tempo real dos veículos
- Visualização e monitoramento ao vivo das corridas
- Criação e gerenciamento de traçados
- Gerenciamento de pilotos e dispositivos
- Análise detalhada de estatísticas das corridas

## Tecnologias

### Frontend
- **Next.js 15** - Framework React para aplicações web
- **React 19** - Biblioteca de componentes UI
- **TailwindCSS** - Framework CSS utilitário

### Backend
- **PostgreSQL** - Banco de dados principal para armazenamento de traçados, corridas e dados de usuários
- **Node.js** - Ambiente de execução
- **Docker** - Containerização para ambiente de desenvolvimento

### Dispositivos IoT
- **ESP8266** - Microcontrolador com WiFi
- **Módulo GPS** - Para rastreamento preciso de localização
- **Protocolo MQTT** - Para transmissão de dados em tempo real

## Funcionalidades

### Rastreamento em Tempo Real
- Transmissão de dados GPS via MQTT
- Taxas de atualização configuráveis (1Hz, 10Hz, 20Hz)
- Reconexão automática
- Transmissão segura de dados

### Gerenciamento de Traçados
- Criação e edição de traçados
- Suporte para limites internos e externos da pista
- Ajuste de rotação e preenchimento
- Configuração de intensidade das curvas

### Gerenciamento de Pilotos
- Perfis e estatísticas dos pilotos
- Ferramentas de comparação de desempenho
- Análise de dados históricos de corridas

### Gerenciamento de Dispositivos
- Interface de configuração
- Configuração automática de WiFi
- Monitoramento de status em tempo real
- Registro e gerenciamento de dispositivos

### Análise de Corridas
- Rastreamento de posição em tempo real
- Cálculos de tempo de volta
- Análise de velocidade
- Funcionalidade de replay da corrida

### Interface do Usuário
- Design moderno e responsivo
- Suporte a temas claro/escuro
- Dashboard interativo
- Atualizações em tempo real

## Estrutura do Projeto

- **`arduino/`**: Código do dispositivo de rastreamento GPS integrado ao ESP8266
  - `kart/` - Código específico para o protótipo de rastreamento
- **`infra/`**: Configurações de infraestrutura Docker para banco de dados e serviços MQTT
- **`migrations/`**: Scripts de migração do banco de dados
- **`pages/`**: Componentes React para o frontend
- **`styles/`**: Configurações de estilo TailwindCSS
- **`tests/`**: Testes automatizados com Jest

## Configuração do Ambiente de Desenvolvimento



### Pré-requisitos

- Node.js e npm instalados
- Docker e Docker Compose configurados
- ESP8266 configurado com o firmware do diretório `arduino/kart`

### Passos para Instalação

1. **Clone o repositório:**
```bash
git clone https://github.com/YuriPierriV/racemap.git
cd racemap
```

2. **Instale as dependências:**
```bash
npm install
```

3. **Inicie os serviços Docker:**
```bash
npm run services:up
```

4. **Inicie o ambiente de desenvolvimento:**
```bash
npm run dev
```

5. **Execute os testes:**
```bash
npm run test
```

## Configuração do Dispositivo IoT

### Requisitos de Hardware

- ESP8266 NodeMCU
- Módulo GPS NEO-6M
- Cabo USB para programação
- Fonte de alimentação (bateria ou USB)

#### Configuração de Conexões:
- 🚧🚧 Trabalhando... 🚧🚧

### Configuração do Dispositivo

1. **Instale as Dependências do Arduino IDE:**
   - Gerenciador de placas ESP8266
   - Biblioteca TinyGPS++
   - Biblioteca PubSubClient
   - Biblioteca ArduinoJson

2. **Upload do Firmware:**
   - Abra `arduino/kart/kart.ino` no Arduino IDE
   - Selecione sua placa ESP8266
   - Configure as credenciais do broker MQTT
   - Faça o upload do código para seu dispositivo

3. **Configuração Inicial:**
   - Ligue o dispositivo
   - Pressione e segure o botão de configuração (conectado ao GPIO D6) por 3 segundos para entrar no modo de configuração
   - O dispositivo indicará que o modo de configuração está ativo via saída serial
   - Conecte-se à rede "ConfigWiFi" (sem senha)
   - Navegue até 192.168.4.1 no seu navegador
   - Configure suas credenciais WiFi
   - O dispositivo se conectará automaticamente e começará a transmitir dados
   - O modo de configuração será desativado automaticamente após 2 minutos se nenhuma alteração for feita

## Scripts Disponíveis

### Desenvolvimento
- **`npm run dev`**: Inicia o ambiente de desenvolvimento completo (serviços, migrações de banco de dados, servidor Next.js)
- **`npm run services:up`**: Inicia os serviços Docker necessários (PostgreSQL, etc.)
- **`npm run services:down`**: Para todos os serviços Docker
- **`npm run services:wait:database`**: Aguarda o PostgreSQL estar pronto (usado por outros scripts)

### Banco de Dados
- **`npm run migrations:up`**: Aplica todas as migrações pendentes
- **`npm run migrations:create`**: Cria um novo arquivo de migração

### Qualidade de Código
- **`npm run lint:prettier:check`**: Verifica a formatação do código sem fazer alterações
- **`npm run lint:prettier:fix`**: Corrige automaticamente problemas de formatação
- **`npm run lint:eslint:check`**: Executa o ESLint para verificar a qualidade do código

### Testes
- **`npm run test`**: Executa todos os testes automatizados com serviços
- **`npm run test:watch`**: Executa testes em modo watch para desenvolvimento

### Controle de Versão
- **`npm run commit`**: Usa commitizen para mensagens de commit padronizadas
- **`npm run prepare`**: Configura os hooks do git com husky (executado automaticamente após install)

## Como Contribuir

1. Faça um fork do projeto
2. Crie sua branch de feature:
```bash
git checkout -b minha-nova-feature
```

3. Prepare suas alterações e faça commit usando commitizen:
```bash
git add .
npm run commit  # Isso irá guiá-lo na criação de uma mensagem de commit padronizada
```

4. Faça push para sua branch:
```bash
git push origin minha-nova-feature
```

5. Envie um pull request

## Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.
