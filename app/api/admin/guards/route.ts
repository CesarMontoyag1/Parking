import { NextResponse } from 'next/server';
import { createAdminClient, createUserClient } from '../../../../lib/supabase/server';

type CreateGuardPayload = {
  tenantId?: string;
  email?: string;
  password?: string;
  fullName?: string;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
  }

  const accessToken = authHeader.slice(7);
  const body = (await request.json().catch(() => ({}))) as CreateGuardPayload;

  const tenantId = body.tenantId?.trim();
  const email = body.email?.trim().toLowerCase();
  const password = body.password || '';
  const fullName = body.fullName?.trim() || null;

  if (!tenantId || !email || !password) {
    return NextResponse.json({ error: 'tenantId, email and password are required.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
  }

  const userClient = createUserClient(accessToken);
  const adminClient = createAdminClient();

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  // El creador debe ser admin activo en la sede objetivo.
  const { data: adminMembership, error: adminMembershipError } = await adminClient
    .from('tenant_users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', user.id)
    .eq('role', 'admin')
    .eq('active', true)
    .maybeSingle();

  if (adminMembershipError) {
    return NextResponse.json({ error: adminMembershipError.message }, { status: 500 });
  }

  if (!adminMembership) {
    return NextResponse.json({ error: 'Only a tenant admin can create guards.' }, { status: 403 });
  }

  const { data: createdUser, error: createdUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      created_by_admin_id: user.id,
      role: 'vigilante',
    },
  });

  if (createdUserError || !createdUser.user) {
    return NextResponse.json({ error: createdUserError?.message || 'Cannot create guard user.' }, { status: 500 });
  }

  const { error: assignError } = await adminClient.from('tenant_users').insert({
    tenant_id: tenantId,
    user_id: createdUser.user.id,
    role: 'vigilante',
    active: true,
  });

  if (assignError) {
    // Limpieza para evitar usuarios huerfanos si falla la asignacion.
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: assignError.message }, { status: 500 });
  }

  return NextResponse.json({
    created: true,
    user: {
      id: createdUser.user.id,
      email: createdUser.user.email,
      fullName,
    },
  });
}
