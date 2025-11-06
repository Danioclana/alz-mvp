# Fase 6: Compartilhamento de Dispositivos

## Objetivo

Permitir que o proprietário de um dispositivo compartilhe acesso com outros usuários (familiares, cuidadores).

## Database Schema

```sql
-- Migration: Device Sharing
CREATE TYPE share_role AS ENUM ('viewer', 'admin', 'owner');

CREATE TABLE device_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
  shared_with_user_id TEXT REFERENCES users(clerk_id),
  shared_by_user_id TEXT REFERENCES users(clerk_id),
  role share_role DEFAULT 'viewer',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(device_id, shared_with_user_id)
);

-- RLS Policies
CREATE POLICY "Users can view their shares"
  ON device_shares FOR SELECT
  USING (
    shared_with_user_id = auth.uid()
    OR shared_by_user_id = auth.uid()
  );

CREATE POLICY "Owners can create shares"
  ON device_shares FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM devices
      WHERE id = device_id AND user_id = auth.uid()
    )
  );

-- Atualizar RLS de devices para incluir shares
DROP POLICY "Users can view their own devices" ON devices;
CREATE POLICY "Users can view their own or shared devices"
  ON devices FOR SELECT
  USING (
    user_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM device_shares
      WHERE device_id = devices.id
      AND shared_with_user_id = auth.uid()
    )
  );
```

## APIs

```typescript
// src/app/api/devices/[id]/shares/route.ts

// GET - Listar compartilhamentos
export async function GET(request, { params }) {
  const { id } = params;

  const { data } = await supabase
    .from('device_shares')
    .select(`
      *,
      shared_with:users!shared_with_user_id(name, email)
    `)
    .eq('device_id', id);

  return NextResponse.json(data);
}

// POST - Criar compartilhamento
export async function POST(request, { params }) {
  const { id } = params;
  const { email, role } = await request.json();

  // Buscar usuário por email
  const { data: user } = await supabase
    .from('users')
    .select('clerk_id')
    .eq('email', email)
    .single();

  if (!user) {
    return NextResponse.json(
      { error: 'Usuário não encontrado' },
      { status: 404 }
    );
  }

  // Criar share
  const { data: share } = await supabase
    .from('device_shares')
    .insert({
      device_id: id,
      shared_with_user_id: user.clerk_id,
      role,
    })
    .select()
    .single();

  // Enviar email de notificação
  await sendShareInviteEmail(email, deviceName);

  return NextResponse.json(share);
}

// DELETE - Remover compartilhamento
export async function DELETE(request, { params }) {
  const { id } = params;
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get('shareId');

  await supabase
    .from('device_shares')
    .delete()
    .eq('id', shareId);

  return NextResponse.json({ success: true });
}
```

## Componentes

```typescript
// src/components/devices/ShareManager.tsx

export function ShareManager({ device }) {
  const [shares, setShares] = useState([]);
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('viewer');

  const handleShare = async () => {
    await fetch(`/api/devices/${device.id}/shares`, {
      method: 'POST',
      body: JSON.stringify({ email: newEmail, role: newRole }),
    });

    fetchShares();
    setNewEmail('');
  };

  return (
    <div className="space-y-4">
      <h3>Compartilhado com</h3>

      {/* Formulário */}
      <div className="flex gap-2">
        <Input
          type="email"
          placeholder="email@exemplo.com"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
        />
        <Select value={newRole} onValueChange={setNewRole}>
          <option value="viewer">Visualizador</option>
          <option value="admin">Administrador</option>
        </Select>
        <Button onClick={handleShare}>Compartilhar</Button>
      </div>

      {/* Lista */}
      <div className="space-y-2">
        {shares.map(share => (
          <div key={share.id} className="flex justify-between items-center p-3 border rounded">
            <div>
              <p className="font-medium">{share.shared_with.name}</p>
              <p className="text-sm text-gray-600">{share.shared_with.email}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge>{share.role}</Badge>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => handleRemove(share.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

## Roles e Permissões

- **owner**: Controle total (excluir device, gerenciar shares)
- **admin**: Configurar alertas e geofences
- **viewer**: Apenas visualizar localização

## Email de Convite

```typescript
// src/lib/services/email.ts

export async function sendShareInviteEmail(email: string, deviceName: string, invitedBy: string) {
  await resend.emails.send({
    from: process.env.ALERTS_FROM_EMAIL,
    to: email,
    subject: `Você foi convidado para acessar ${deviceName}`,
    html: `
      <h2>Alzheimer Care - Convite de Acesso</h2>
      <p>${invitedBy} compartilhou o dispositivo <strong>${deviceName}</strong> com você.</p>
      <p>Acesse o app para visualizar a localização e configurar alertas.</p>
      <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard">Acessar Dashboard</a>
    `,
  });
}
```

## Checklist

- [ ] Criar migration
- [ ] Atualizar RLS policies
- [ ] Criar APIs de shares
- [ ] Criar ShareManager component
- [ ] Adicionar controle de permissões no frontend
- [ ] Implementar email de convite
- [ ] Testar diferentes roles
- [ ] Validar segurança

## Tempo Estimado
**Total: ~12 horas (1-2 dias)**
