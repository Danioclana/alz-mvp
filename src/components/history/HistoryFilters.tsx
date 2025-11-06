'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar, Download } from 'lucide-react';

interface HistoryFiltersProps {
  onDateRangeChange: (startDate: string, endDate: string) => void;
  onExportCSV: () => void;
}

export function HistoryFilters({ onDateRangeChange, onExportCSV }: HistoryFiltersProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleApplyFilter = () => {
    if (startDate && endDate) {
      onDateRangeChange(startDate, endDate);
    }
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);

    const endStr = end.toISOString().split('T')[0];
    const startStr = start.toISOString().split('T')[0];

    setStartDate(startStr);
    setEndDate(endStr);
    onDateRangeChange(startStr, endStr);
  };

  const handleClearFilter = () => {
    setStartDate('');
    setEndDate('');
    onDateRangeChange('', '');
  };

  return (
    <div className="bg-white rounded-lg border p-4 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <Calendar className="h-5 w-5 text-gray-600" />
        <h3 className="font-semibold text-lg">Filtrar por período</h3>
      </div>

      {/* Quick filters */}
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleQuickFilter(1)}
        >
          Hoje
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleQuickFilter(7)}
        >
          Últimos 7 dias
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => handleQuickFilter(30)}
        >
          Últimos 30 dias
        </Button>
      </div>

      {/* Custom date range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Data inicial
          </label>
          <Input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">
            Data final
          </label>
          <Input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex gap-2">
        <Button
          onClick={handleApplyFilter}
          disabled={!startDate || !endDate}
          className="flex-1"
        >
          Aplicar Filtro
        </Button>
        <Button
          variant="secondary"
          onClick={handleClearFilter}
        >
          Limpar
        </Button>
        <Button
          variant="secondary"
          onClick={onExportCSV}
        >
          <Download className="h-4 w-4 mr-2" />
          Exportar CSV
        </Button>
      </div>
    </div>
  );
}
