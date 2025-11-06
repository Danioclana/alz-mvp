# Fase 5: Dashboard de Analytics

## Objetivo

Criar dashboard com visualizações de dados:
- Gráficos de bateria ao longo do tempo
- Heatmap de localizações frequentes
- Estatísticas de alertas
- Tempo dentro/fora de zonas
- Exportação de relatórios PDF

## Bibliotecas

```bash
npm install recharts date-fns jspdf
npm install @react-pdf/renderer
```

## Componentes a Criar

### 1. Gráfico de Bateria
```typescript
// src/components/analytics/BatteryChart.tsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';

export function BatteryChart({ data }) {
  return (
    <LineChart width={600} height={300} data={data}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="timestamp" />
      <YAxis domain={[0, 100]} />
      <Tooltip />
      <Line type="monotone" dataKey="battery" stroke="#10b981" />
    </LineChart>
  );
}
```

### 2. Heatmap de Localizações
```typescript
// src/components/analytics/LocationHeatmap.tsx
import { MapContainer, TileLayer } from 'react-leaflet';
import HeatmapLayer from 'react-leaflet-heatmap-layer-v3';

export function LocationHeatmap({ locations }) {
  const points = locations.map(loc => [loc.latitude, loc.longitude, 1]);

  return (
    <MapContainer center={[-23.55, -46.63]} zoom={13}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <HeatmapLayer points={points} />
    </MapContainer>
  );
}
```

### 3. Estatísticas de Alertas
```typescript
// src/components/analytics/AlertStats.tsx
import { BarChart, Bar, XAxis, YAxis } from 'recharts';

export function AlertStats({ alerts }) {
  const grouped = groupAlertsByDay(alerts);

  return (
    <BarChart width={600} height={300} data={grouped}>
      <XAxis dataKey="day" />
      <YAxis />
      <Bar dataKey="count" fill="#ef4444" />
    </BarChart>
  );
}
```

### 4. Tempo em Zonas
```typescript
// src/components/analytics/ZoneTimeChart.tsx
import { PieChart, Pie, Cell, Legend } from 'recharts';

export function ZoneTimeChart({ data }) {
  return (
    <PieChart width={400} height={400}>
      <Pie
        data={data}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={100}
      >
        <Cell fill="#10b981" />
        <Cell fill="#ef4444" />
      </Pie>
      <Legend />
    </PieChart>
  );
}
```

## API Analytics

```typescript
// src/app/api/analytics/[hardwareId]/route.ts
export async function GET(request, { params }) {
  const { hardwareId } = params;
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get('startDate');
  const endDate = searchParams.get('endDate');

  // Buscar dados
  const locations = await getLocationsInRange(hardwareId, startDate, endDate);
  const alerts = await getAlertsInRange(hardwareId, startDate, endDate);

  // Calcular estatísticas
  const stats = {
    totalDistance: calculateTotalDistance(locations),
    avgBattery: calculateAvgBattery(locations),
    totalAlerts: alerts.length,
    timeInSafeZones: calculateTimeInZones(locations),
  };

  return NextResponse.json({
    locations,
    alerts,
    stats,
  });
}
```

## Página Analytics

```typescript
// src/app/(dashboard)/analytics/[hardwareId]/page.tsx
'use client';

import { BatteryChart } from '@/components/analytics/BatteryChart';
import { LocationHeatmap } from '@/components/analytics/LocationHeatmap';
import { AlertStats } from '@/components/analytics/AlertStats';
import { ZoneTimeChart } from '@/components/analytics/ZoneTimeChart';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [dateRange, setDateRange] = useState({ start: '...', end: '...' });

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange]);

  return (
    <div className="space-y-8">
      <h1>Analytics - {device.name}</h1>

      {/* Filtros de Data */}
      <DateRangePicker value={dateRange} onChange={setDateRange} />

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Distância Total" value={`${stats.totalDistance} km`} />
        <StatCard title="Bateria Média" value={`${stats.avgBattery}%`} />
        <StatCard title="Total de Alertas" value={stats.totalAlerts} />
        <StatCard title="Tempo em Zonas" value={`${stats.timeInSafeZones}%`} />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-2 gap-6">
        <Card>
          <h3>Bateria ao Longo do Tempo</h3>
          <BatteryChart data={data.locations} />
        </Card>

        <Card>
          <h3>Alertas por Dia</h3>
          <AlertStats alerts={data.alerts} />
        </Card>

        <Card>
          <h3>Heatmap de Localizações</h3>
          <LocationHeatmap locations={data.locations} />
        </Card>

        <Card>
          <h3>Tempo Dentro/Fora de Zonas</h3>
          <ZoneTimeChart data={data.zoneTime} />
        </Card>
      </div>

      {/* Botão Exportar */}
      <Button onClick={exportToPDF}>Exportar Relatório PDF</Button>
    </div>
  );
}
```

## Tempo Estimado
**Total: ~16 horas (2 dias)**
