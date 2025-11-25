import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime, formatBatteryLevel } from '@/lib/utils/format';
import type { Device, Location } from '@/types';

interface DeviceCardProps {
  device: Device & { lastLocation?: Location | null };
}

export function DeviceCard({ device }: DeviceCardProps) {
  const batteryLevel = device.battery_level;
  const isLowBattery = batteryLevel !== null && batteryLevel < 20;
  const isCriticalBattery = batteryLevel !== null && batteryLevel < 10;

  const isStale = device.last_location_at
    ? new Date().getTime() - new Date(device.last_location_at).getTime() > 30 * 60 * 1000
    : true;

  return (
    <Link href={`/devices/${device.hardware_id}`}>
      <Card className="hover:shadow-lg transition-all cursor-pointer border-border/50 bg-card/50 backdrop-blur-sm" hoverEffect>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {device.name}
              </h3>
              <p className="text-sm text-muted-foreground">{device.patient_name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              {isStale && (
                <Badge variant="warning">Sem sinal</Badge>
              )}
              {!isStale && device.lastLocation && (
                <Badge variant="success">Online</Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Bateria:</span>
              <span className={`font-medium ${isCriticalBattery ? 'text-destructive' : isLowBattery ? 'text-warning' : 'text-foreground'
                }`}>
                {formatBatteryLevel(batteryLevel)}
              </span>
            </div>

            {device.last_location_at && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Última atualização:</span>
                <span className="text-foreground">
                  {formatRelativeTime(device.last_location_at)}
                </span>
              </div>
            )}

            {device.lastLocation && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Localização:</span>
                <span className="text-foreground font-mono text-xs">
                  {device.lastLocation.latitude.toFixed(6)}, {device.lastLocation.longitude.toFixed(6)}
                </span>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground">
              ID: {device.hardware_id}
            </p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
