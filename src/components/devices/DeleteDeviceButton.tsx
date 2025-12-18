'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';

interface DeleteDeviceButtonProps {
  hardwareId: string;
  deviceName: string;
}

export function DeleteDeviceButton({ hardwareId, deviceName }: DeleteDeviceButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir o dispositivo "${deviceName}"? Esta ação não pode ser desfeita.`
    );

    if (!confirmed) return;

    setIsDeleting(true);

    try {
      const response = await fetch(`/api/devices/${hardwareId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Falha ao excluir dispositivo');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error) {
      console.error('Error deleting device:', error);
      alert('Erro ao excluir dispositivo. Tente novamente.');
      setIsDeleting(false);
    }
  };

  return (
    <Button 
      variant="danger" 
      onClick={handleDelete} 
      disabled={isDeleting}
      className="flex items-center gap-2"
    >
      <Trash2 className="h-4 w-4" />
      {isDeleting ? 'Excluindo...' : 'Excluir Dispositivo'}
    </Button>
  );
}
