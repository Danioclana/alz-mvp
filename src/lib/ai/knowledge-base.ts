/**
 * Base de Conhecimento do Sistema Alzheimer Care
 * 
 * Este arquivo contém informações detalhadas sobre o sistema que serão
 * usadas pelo assistente virtual para responder perguntas dos usuários.
 */

export const SYSTEM_KNOWLEDGE = {
    // Informações Gerais
    about: `
O Alzheimer Care é um sistema inteligente de rastreamento desenvolvido especificamente 
para ajudar cuidadores de pessoas com Doença de Alzheimer. O sistema combina:

- **Dispositivo de Rastreamento GPS**: Monitora a localização em tempo real
- **Aplicativo Web**: Interface para visualizar localização e configurar o sistema
- **Zonas Seguras (Geofences)**: Áreas virtuais que você define como seguras
- **Alertas Automáticos**: Notificações por email quando a pessoa sai de uma zona segura
- **Assistente Virtual IA**: Eu! Estou aqui para ajudar você a usar o sistema

O objetivo é aumentar a segurança da pessoa com Alzheimer e dar tranquilidade 
ao cuidador, sabendo que receberá um alerta caso algo incomum aconteça.
  `,

    // Como Funciona
    howItWorks: `
**Como o Sistema Funciona:**

1. **Rastreamento GPS**
   - O dispositivo coleta a localização via GPS a cada poucos minutos
   - Os dados são enviados via internet (4G) para nossos servidores
   - Você pode ver a localização atual no mapa do aplicativo

2. **Zonas Seguras**
   - Você define áreas circulares no mapa (ex: casa, parque, mercado)
   - O sistema monitora se a pessoa está dentro ou fora dessas zonas
   - Quando ela sai de uma zona segura, você recebe um alerta

3. **Alertas**
   - Alertas são enviados por email automaticamente
   - Você pode configurar múltiplos emails para receber alertas
   - O sistema evita spam (não envia alertas repetidos muito rápido)
   - Você pode pausar alertas temporariamente (modo acompanhado)

4. **Histórico**
   - Todas as localizações são armazenadas
   - Você pode ver o histórico de movimentação
   - Útil para entender padrões e rotinas
  `,

    // Zonas Seguras (Geofences)
    geofences: `
**Zonas Seguras (Geofences)**

Uma zona segura é uma área circular que você define no mapa. Quando a pessoa 
com Alzheimer sai dessa área, você recebe um alerta.

**Como Criar uma Zona Segura:**
1. Vá para a página do dispositivo
2. Clique em "Editar Áreas Seguras"
3. Clique no mapa onde quer criar a zona
4. Ajuste o raio (tamanho) da zona
5. Dê um nome (ex: "Casa", "Parque do Bairro")
6. Salve

**Dicas:**
- Crie zonas para locais frequentes (casa, casa de familiares, parque)
- Use raio de 50-100 metros para residências
- Use raio maior (200-500m) para parques ou áreas abertas
- Você pode ter múltiplas zonas ativas
- Pode ativar/desativar zonas sem deletá-las

**Exemplos de Uso:**
- Zona "Casa" com 50m: alerta se sair de casa sozinho
- Zona "Parque" com 200m: alerta se sair do parque durante passeio
- Zona "Casa da Filha" com 50m: alerta se sair durante visita
  `,

    // Sistema de Alertas
    alerts: `
**Sistema de Alertas**

**Tipos de Alertas:**
1. **Saída de Zona Segura**: Quando a pessoa sai de uma área definida
2. **Bateria Baixa**: Quando a bateria do dispositivo está acabando (< 20%)

**Configuração de Alertas:**
- Você pode configurar múltiplos emails para receber alertas
- Defina a frequência mínima entre alertas (padrão: 15 minutos)
- Ative/desative alertas conforme necessário

**Modo Acompanhado:**
Quando você está com a pessoa, pode ativar o "modo acompanhado" para 
pausar os alertas temporariamente. Útil para:
- Passeios programados
- Visitas a locais novos
- Consultas médicas

**O que fazer ao receber um alerta:**
1. Verifique a localização no mapa (link no email)
2. Tente contato telefônico
3. Se não conseguir contato, vá até o local
4. Em emergência, acione familiares ou autoridades

**Throttling (Anti-Spam):**
O sistema não envia alertas repetidos muito rapidamente. Se a pessoa 
continuar fora da zona, você receberá um novo alerta apenas após o 
intervalo configurado (padrão: 15 minutos).
  `,

    // Dispositivo
    device: `
**Sobre o Dispositivo de Rastreamento**

**Componentes:**
- GPS para localização precisa
- Módulo 4G para envio de dados
- Bateria recarregável
- LED indicador de status

**Bateria:**
- Autonomia: aproximadamente 24-48 horas (depende do uso)
- Carregamento: via cabo USB (incluído)
- Indicador de bateria: visível no aplicativo
- Alerta de bateria baixa: quando < 20%

**Precisão:**
- GPS: precisão de 5-10 metros em área aberta
- Pode ter menor precisão em áreas fechadas ou com prédios altos
- Requer visão do céu para funcionar bem

**Conectividade:**
- Usa rede 4G para enviar dados
- Funciona onde há cobertura de celular
- Não depende de WiFi

**Uso:**
- Pode ser usado no bolso, bolsa ou preso à roupa
- Resistente a respingos (não mergulhar em água)
- Leve e discreto
  `,

    // Privacidade e Segurança
    privacy: `
**Privacidade e Segurança**

**Seus Dados:**
- Apenas você tem acesso aos dados do seu dispositivo
- Localizações são criptografadas
- Não compartilhamos dados com terceiros
- Você pode deletar o histórico a qualquer momento

**Segurança:**
- Acesso protegido por senha
- Autenticação de dois fatores disponível
- Conexões criptografadas (HTTPS)
- Dados armazenados em servidores seguros

**LGPD:**
- Sistema em conformidade com a Lei Geral de Proteção de Dados
- Você tem direito a acessar, corrigir e deletar seus dados
- Dados são usados apenas para o funcionamento do sistema
  `,

    // Troubleshooting
    troubleshooting: `
**Problemas Comuns e Soluções**

**1. Dispositivo não aparece no mapa**
- Verifique se o dispositivo está ligado
- Confirme se há bateria
- Verifique se está em local aberto (GPS precisa de visão do céu)
- Aguarde alguns minutos - pode demorar para obter sinal GPS inicial

**2. Localização imprecisa**
- GPS funciona melhor em áreas abertas
- Em ambientes fechados ou com prédios altos, a precisão diminui
- Aguarde alguns minutos para o GPS estabilizar

**3. Não estou recebendo alertas**
- Verifique se os alertas estão ativados nas configurações
- Confirme se o email está correto
- Verifique sua caixa de spam
- Verifique se não está em "modo acompanhado"

**4. Bateria acaba rápido**
- Bateria dura ~24-48h em uso normal
- Carregue completamente antes de usar
- Evite temperaturas extremas
- Se o problema persistir, entre em contato

**5. Muitos alertas (spam)**
- Ajuste a frequência de alertas nas configurações
- Aumente o raio da zona segura se for muito pequeno
- Use "modo acompanhado" quando estiver junto

**6. Esqueci minha senha**
- Use a opção "Esqueci minha senha" na tela de login
- Você receberá um email para redefinir
  `,

    // FAQ
    faq: [
        {
            question: "Quanto custa o sistema?",
            answer: "O sistema tem um custo inicial do dispositivo e uma mensalidade para manutenção dos servidores e envio de dados. Entre em contato para valores atualizados."
        },
        {
            question: "Funciona em todo o Brasil?",
            answer: "Sim! O sistema funciona em qualquer lugar com cobertura de rede 4G, que cobre a maior parte do território brasileiro."
        },
        {
            question: "Preciso de internet no celular para usar?",
            answer: "Você precisa de internet para acessar o aplicativo web e ver a localização. O dispositivo usa sua própria conexão 4G."
        },
        {
            question: "Posso ter mais de um dispositivo?",
            answer: "Sim! Você pode cadastrar múltiplos dispositivos na mesma conta."
        },
        {
            question: "Outras pessoas podem ver a localização?",
            answer: "Apenas pessoas que você autorizar (compartilhando login) podem ver. Estamos trabalhando em um sistema de compartilhamento mais seguro."
        },
        {
            question: "O que acontece se a bateria acabar?",
            answer: "Você receberá um alerta quando a bateria estiver baixa (< 20%). A última localização conhecida ficará salva no sistema."
        },
        {
            question: "Funciona em outros países?",
            answer: "Depende da cobertura 4G do país. Em geral, funciona na América Latina e Europa. Consulte-nos para países específicos."
        },
        {
            question: "Como faço para carregar o dispositivo?",
            answer: "Use o cabo USB incluído. Conecte em qualquer carregador de celular (5V). Leva aproximadamente 2-3 horas para carga completa."
        }
    ],

    // Dicas para Cuidadores
    caregiverTips: `
**Dicas para Cuidadores**

**Uso do Sistema:**
1. Configure zonas seguras nos locais mais frequentados
2. Teste o sistema antes de depender dele completamente
3. Mantenha o dispositivo sempre carregado
4. Verifique regularmente se está funcionando

**Cuidados com a Pessoa:**
1. Explique o dispositivo de forma simples e tranquilizadora
2. Faça parecer um acessório normal (relógio, chaveiro)
3. Crie rotina de carregar o dispositivo
4. Não use apenas como substituto da supervisão presencial

**Gerenciamento de Alertas:**
1. Configure emails de familiares de confiança
2. Tenha um plano de ação para quando receber alertas
3. Use modo acompanhado em passeios programados
4. Revise o histórico para entender padrões

**Apoio Emocional:**
Cuidar de alguém com Alzheimer é desafiador. Lembre-se:
- Você não está sozinho
- É normal sentir-se sobrecarregado
- Busque apoio de grupos de cuidadores
- Cuide também da sua saúde mental
- Este sistema é uma ferramenta para ajudar, não para substituir o cuidado humano
  `
};

// Função helper para buscar informações
export function getKnowledge(topic: string): string {
    const topicLower = topic.toLowerCase();

    if (topicLower.includes('sobre') || topicLower.includes('o que é')) {
        return SYSTEM_KNOWLEDGE.about;
    }

    if (topicLower.includes('funciona') || topicLower.includes('como usar')) {
        return SYSTEM_KNOWLEDGE.howItWorks;
    }

    if (topicLower.includes('zona') || topicLower.includes('geofence') || topicLower.includes('área segura')) {
        return SYSTEM_KNOWLEDGE.geofences;
    }

    if (topicLower.includes('alerta') || topicLower.includes('notifica')) {
        return SYSTEM_KNOWLEDGE.alerts;
    }

    if (topicLower.includes('dispositivo') || topicLower.includes('bateria') || topicLower.includes('gps')) {
        return SYSTEM_KNOWLEDGE.device;
    }

    if (topicLower.includes('privacidade') || topicLower.includes('segurança') || topicLower.includes('dados')) {
        return SYSTEM_KNOWLEDGE.privacy;
    }

    if (topicLower.includes('problema') || topicLower.includes('não funciona') || topicLower.includes('erro')) {
        return SYSTEM_KNOWLEDGE.troubleshooting;
    }

    return '';
}
