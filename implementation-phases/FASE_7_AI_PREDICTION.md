# Fase 7: IA Preditiva para Zonas Seguras

## Objetivo

Implementar modelo de Machine Learning para:
- Analisar padrões de movimento do paciente
- Identificar locais frequentes automaticamente
- Sugerir geofences inteligentes
- Detectar comportamentos anômalos

## Arquitetura

```
┌─────────────────────┐
│ PostgreSQL          │
│ (3-4 semanas dados) │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Python ML Service   │
│ - Feature Eng.      │
│ - DBSCAN Clustering │
│ - Model Training    │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ FastAPI             │
│ (Predictions API)   │
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ Next.js             │
│ (Suggest UI)        │
└─────────────────────┘
```

## Stack de ML

```bash
pip install scikit-learn pandas numpy fastapi uvicorn psycopg2-binary
```

## Pipeline de Dados

```python
# scripts/ml/data_pipeline.py
import pandas as pd
from sklearn.cluster import DBSCAN
from sklearn.preprocessing import StandardScaler
import numpy as np

def fetch_location_data(hardware_id: str, days: int = 30):
    """Buscar dados históricos do PostgreSQL"""
    query = f"""
    SELECT
        latitude,
        longitude,
        EXTRACT(HOUR FROM timestamp) as hour,
        EXTRACT(DOW FROM timestamp) as day_of_week,
        battery_level
    FROM locations
    WHERE hardware_id = '{hardware_id}'
      AND timestamp > NOW() - INTERVAL '{days} days'
    ORDER BY timestamp
    """

    df = pd.read_sql(query, connection)
    return df

def extract_features(df: pd.DataFrame):
    """Engenharia de features"""
    features = df[['latitude', 'longitude', 'hour', 'day_of_week']]

    # Normalizar coordenadas
    scaler = StandardScaler()
    features[['latitude', 'longitude']] = scaler.fit_transform(
        features[['latitude', 'longitude']]
    )

    return features, scaler

def cluster_locations(features: pd.DataFrame, eps=0.001, min_samples=5):
    """Clustering com DBSCAN"""
    db = DBSCAN(eps=eps, min_samples=min_samples)
    labels = db.fit_predict(features[['latitude', 'longitude']])

    return labels

def extract_safe_zones(df: pd.DataFrame, labels: np.ndarray):
    """Extrair centros e raios dos clusters"""
    df['cluster'] = labels

    zones = []
    for cluster_id in set(labels):
        if cluster_id == -1:  # Ruído
            continue

        cluster_points = df[df['cluster'] == cluster_id]

        # Calcular centro (mediana)
        center_lat = cluster_points['latitude'].median()
        center_lng = cluster_points['longitude'].median()

        # Calcular raio (percentil 95 das distâncias)
        distances = np.sqrt(
            (cluster_points['latitude'] - center_lat) ** 2 +
            (cluster_points['longitude'] - center_lng) ** 2
        )
        radius = np.percentile(distances, 95) * 111000  # Converter para metros

        # Análise temporal
        hours = cluster_points['hour'].value_counts().idxmax()
        days = cluster_points['day_of_week'].value_counts().idxmax()

        zones.append({
            'latitude': center_lat,
            'longitude': center_lng,
            'radius': max(50, int(radius)),  # Mínimo 50m
            'visits': len(cluster_points),
            'confidence': len(cluster_points) / len(df),
            'typical_hour': int(hours),
            'typical_day': int(days),
        })

    # Ordenar por confiança
    zones.sort(key=lambda z: z['confidence'], reverse=True)

    return zones
```

## API FastAPI

```python
# scripts/ml/api.py
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn

app = FastAPI()

class PredictionRequest(BaseModel):
    hardware_id: str
    days: int = 30

class PredictionResponse(BaseModel):
    zones: list
    model_version: str
    data_points: int

@app.post("/predict-zones", response_model=PredictionResponse)
async def predict_zones(request: PredictionRequest):
    try:
        # Fetch data
        df = fetch_location_data(request.hardware_id, request.days)

        if len(df) < 50:
            raise HTTPException(
                status_code=400,
                detail="Dados insuficientes. Mínimo 50 localizações."
            )

        # Feature engineering
        features, scaler = extract_features(df)

        # Clustering
        labels = cluster_locations(features)

        # Extract zones
        zones = extract_safe_zones(df, labels)

        return PredictionResponse(
            zones=zones,
            model_version="1.0.0",
            data_points=len(df)
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

## Integração Next.js

```typescript
// src/app/api/ml/predict-zones/route.ts

export async function POST(request: NextRequest) {
  const { hardwareId } = await request.json();

  try {
    // Chamar ML API
    const response = await fetch('http://ml-service:8000/predict-zones', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hardware_id: hardwareId, days: 30 }),
    });

    const predictions = await response.json();

    return NextResponse.json(predictions);
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao gerar predições' },
      { status: 500 }
    );
  }
}
```

## UI de Sugestões

```typescript
// src/components/geofences/ZoneSuggestions.tsx

export function ZoneSuggestions({ hardwareId }) {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const generateSuggestions = async () => {
    setLoading(true);

    const res = await fetch('/api/ml/predict-zones', {
      method: 'POST',
      body: JSON.stringify({ hardwareId }),
    });

    const data = await res.json();
    setSuggestions(data.zones);
    setLoading(false);
  };

  const handleAccept = async (zone) => {
    // Criar geofence baseada na sugestão
    await fetch(`/api/geofences/${hardwareId}`, {
      method: 'POST',
      body: JSON.stringify({
        name: `Zona Sugerida ${zone.typical_hour}h`,
        latitude: zone.latitude,
        longitude: zone.longitude,
        radius: zone.radius,
      }),
    });

    // Remover da lista
    setSuggestions(prev => prev.filter(s => s !== zone));
  };

  return (
    <div className="space-y-4">
      <Button onClick={generateSuggestions} disabled={loading}>
        {loading ? 'Analisando...' : 'Gerar Sugestões com IA'}
      </Button>

      {suggestions.length > 0 && (
        <div className="space-y-3">
          <h3 className="font-semibold">Zonas Sugeridas</h3>

          {suggestions.map((zone, idx) => (
            <Card key={idx} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium">Zona #{idx + 1}</h4>
                  <p className="text-sm text-gray-600">
                    Raio: {zone.radius}m | {zone.visits} visitas
                  </p>
                  <p className="text-sm text-gray-600">
                    Confiança: {(zone.confidence * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">
                    Típico: {getDayName(zone.typical_day)} às {zone.typical_hour}h
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAccept(zone)}>
                    Aceitar
                  </Button>
                  <Button size="sm" variant="ghost">
                    Rejeitar
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Deploy ML Service

### Opção 1: Render

```yaml
# render.yaml
services:
  - type: web
    name: alzcare-ml
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: uvicorn api:app --host 0.0.0.0 --port 8000
```

### Opção 2: Railway

```toml
# railway.toml
[build]
builder = "NIXPACKS"

[deploy]
startCommand = "uvicorn api:app --host 0.0.0.0 --port $PORT"
```

## Detecção de Anomalias (Bonus)

```python
# Detectar se paciente está fora de padrão
def detect_anomaly(current_location, historical_zones):
    """Retorna True se localização é anômala"""
    # Verificar se está longe de todas as zonas conhecidas
    for zone in historical_zones:
        distance = haversine(
            current_location['latitude'],
            current_location['longitude'],
            zone['latitude'],
            zone['longitude']
        )

        if distance <= zone['radius']:
            return False  # Dentro de zona conhecida

    # Verificar hora do dia
    current_hour = datetime.now().hour
    typical_hours = [z['typical_hour'] for z in historical_zones]

    if current_hour not in typical_hours:
        return True  # Horário atípico

    return True  # Localização anômala
```

## Checklist

- [ ] Setup ambiente Python
- [ ] Implementar pipeline de dados
- [ ] Implementar clustering DBSCAN
- [ ] Criar FastAPI
- [ ] Testar predições localmente
- [ ] Deploy ML service (Render/Railway)
- [ ] Integrar com Next.js
- [ ] Criar UI de sugestões
- [ ] Implementar detecção de anomalias
- [ ] Testes com dados reais

## Requisitos Mínimos

- 50+ localizações para treinamento
- 3-4 semanas de dados históricos
- Visitas regulares a locais

## Tempo Estimado
**Total: ~40 horas (5 dias)**

## Referências

- DBSCAN: https://scikit-learn.org/stable/modules/clustering.html#dbscan
- FastAPI: https://fastapi.tiangolo.com/
- Geospatial Clustering: https://towardsdatascience.com/geospatial-clustering
