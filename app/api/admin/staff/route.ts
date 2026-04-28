import { NextResponse } from 'next/server';
import { createAdminClient, createUserClient } from '../../../../lib/supabase/server';

type CreateStaffPayload = {
  tenantId?: string;
  role?: 'admin' | 'vigilante';
  email?: string;
  password?: string;
  fullName?: string;
};

type DeleteStaffPayload = {
  tenantId?: string;
  staffId?: string;
};

type TenantContext = {
  accountId: string;
  isOwner: boolean;
};

async function getRequestUser(accessToken: string) {
  const userClient = createUserClient(accessToken);
  const {
    data: { user },
    error,
  } = await userClient.auth.getUser();

  if (error || !user) {
    return null;
  }

  return user;
}

async function getTenantContext(adminClient: ReturnType<typeof createAdminClient>, tenantId: string, userId: string): Promise<TenantContext | null> {
  const { data: tenant, error: tenantError } = await adminClient
    .from('tenants')
    .select('account_id')
    .eq('id', tenantId)
    .maybeSingle();

  if (tenantError || !tenant) {
    return null;
  }

  const { data: ownerMembership, error: ownerError } = await adminClient
    .from('memberships')
    .select('id')
    .eq('account_id', tenant.account_id)
    .eq('user_id', userId)
    .eq('role', 'owner')
    .maybeSingle();

  if (ownerError) {
    return null;
  }

  return {
    accountId: tenant.account_id,
    isOwner: Boolean(ownerMembership),
  };
}

async function canViewStaff(adminClient: ReturnType<typeof createAdminClient>, tenantId: string, userId: string): Promise<boolean> {
  const { data, error } = await adminClient
    .from('tenant_users')
    .select('id')
    .eq('tenant_id', tenantId)
    .eq('user_id', userId)
    .eq('role', 'admin')
    .eq('active', true)
    .maybeSingle();

  if (error) {
    return false;
  }

  return Boolean(data);
}

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
  }

  const tenantId = new URL(request.url).searchParams.get('tenantId')?.trim();
  if (!tenantId) {
    return NextResponse.json({ error: 'tenantId is required.' }, { status: 400 });
  }

  const accessToken = authHeader.slice(7);
  const user = await getRequestUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const context = await getTenantContext(adminClient, tenantId, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  const canView = context.isOwner || (await canViewStaff(adminClient, tenantId, user.id));
  if (!canView) {
    return NextResponse.json({ error: 'Not allowed to view staff for this tenant.' }, { status: 403 });
  }

  const { data: staffRows, error: staffError } = await adminClient
    .from('tenant_users')
    .select('id, user_id, role, active, created_at')
    .eq('tenant_id', tenantId)
    .order('created_at', { ascending: false });

  if (staffError) {
    return NextResponse.json({ error: staffError.message }, { status: 500 });
  }

  const staff = await Promise.all(
    (staffRows || []).map(async (row) => {
      const { data: authData } = await adminClient.auth.admin.getUserById(row.user_id);
      return {
        id: row.id,
        user_id: row.user_id,
        role: row.role,
        active: row.active,
        created_at: row.created_at,
        email: authData?.user?.email || null,
        full_name: (authData?.user?.user_metadata?.full_name as string | undefined) || null,
      };
    })
  );

  return NextResponse.json({
    staff,
    isOwner: context.isOwner,
  });
}

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as CreateStaffPayload;
  const tenantId = body.tenantId?.trim();
  const role = body.role;
  const email = body.email?.trim().toLowerCase();
  const password = body.password || '';
  const fullName = body.fullName?.trim() || null;

  if (!tenantId || !role || !email || !password) {
    return NextResponse.json({ error: 'tenantId, role, email and password are required.' }, { status: 400 });
  }

  if (role !== 'admin' && role !== 'vigilante') {
    return NextResponse.json({ error: 'Role must be admin or vigilante.' }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: 'Password must be at least 8 characters long.' }, { status: 400 });
  }

  const accessToken = authHeader.slice(7);
  const user = await getRequestUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const context = await getTenantContext(adminClient, tenantId, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  // Allow owner to create any staff. Allow admins to create vigilantes only.
  const canCreate = context.isOwner || (role === 'vigilante' && (await canViewStaff(adminClient, tenantId, user.id)));
  if (!canCreate) {
    return NextResponse.json({ error: 'Not allowed to create staff users for this tenant.' }, { status: 403 });
  }

  const { data: account, error: accountError } = await adminClient
    .from('accounts')
    .select('plan_id')
    .eq('id', context.accountId)
    .single();

  if (accountError || !account) {
    return NextResponse.json({ error: accountError?.message || 'Account not found.' }, { status: 500 });
  }

  const { data: plan, error: planError } = await adminClient
    .from('plans')
    .select('max_admins, max_vigilantes')
    .eq('id', account.plan_id)
    .single();

  if (planError || !plan) {
    return NextResponse.json({ error: planError?.message || 'Plan not found.' }, { status: 500 });
  }

  const { count: roleCount, error: countError } = await adminClient
    .from('tenant_users')
    .select('id', { head: true, count: 'exact' })
    .eq('tenant_id', tenantId)
    .eq('role', role)
    .eq('active', true);

  if (countError) {
    return NextResponse.json({ error: countError.message }, { status: 500 });
  }

  const maxAllowed = role === 'admin' ? plan.max_admins : plan.max_vigilantes;
  if ((roleCount || 0) >= maxAllowed) {
    return NextResponse.json({ error: `Plan limit reached for role ${role}.` }, { status: 409 });
  }

  const { data: createdUser, error: createdUserError } = await adminClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
      created_by_owner_id: user.id,
      role,
      tenant_id: tenantId,
    },
  });

  if (createdUserError || !createdUser.user) {
    return NextResponse.json({ error: createdUserError?.message || 'Cannot create user.' }, { status: 500 });
  }

  const { error: assignError } = await adminClient.from('tenant_users').insert({
    tenant_id: tenantId,
    user_id: createdUser.user.id,
    role,
    active: true,
  });

  if (assignError) {
    await adminClient.auth.admin.deleteUser(createdUser.user.id);
    return NextResponse.json({ error: assignError.message }, { status: 500 });
  }

  return NextResponse.json({
    created: true,
    user: {
      id: createdUser.user.id,
      email: createdUser.user.email,
      full_name: fullName,
      role,
    },
  });
}

export async function DELETE(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
    return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
  }

  const body = (await request.json().catch(() => ({}))) as DeleteStaffPayload;
  const tenantId = body.tenantId?.trim();
  const staffId = body.staffId?.trim();

  if (!tenantId || !staffId) {
    return NextResponse.json({ error: 'tenantId and staffId are required.' }, { status: 400 });
  }

  const accessToken = authHeader.slice(7);
  const user = await getRequestUser(accessToken);

  if (!user) {
    return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  const adminClient = createAdminClient();
  const context = await getTenantContext(adminClient, tenantId, user.id);
  if (!context) {
    return NextResponse.json({ error: 'Tenant not found.' }, { status: 404 });
  }

  if (!context.isOwner) {
    return NextResponse.json({ error: 'Only the parking owner can remove staff users.' }, { status: 403 });
  }

  const { data: targetStaff, error: targetError } = await adminClient
    .from('tenant_users')
    .select('id, user_id, role')
    .eq('id', staffId)
    .eq('tenant_id', tenantId)
    .maybeSingle();

  if (targetError) {
    return NextResponse.json({ error: targetError.message }, { status: 500 });
  }

  if (!targetStaff) {
    return NextResponse.json({ error: 'Staff member not found.' }, { status: 404 });
  }

  if (targetStaff.user_id === user.id) {
    return NextResponse.json({ error: 'Owner cannot remove themselves from staff.' }, { status: 400 });
  }

  const { data: ownerMembership, error: ownerMembershipError } = await adminClient
    .from('memberships')
    .select('id')
    .eq('account_id', context.accountId)
    .eq('user_id', targetStaff.user_id)
    .eq('role', 'owner')
    .maybeSingle();

  if (ownerMembershipError) {
    return NextResponse.json({ error: ownerMembershipError.message }, { status: 500 });
  }

  if (ownerMembership) {
    return NextResponse.json({ error: 'Owner account cannot be removed.' }, { status: 403 });
  }

  const { error: deleteError } = await adminClient
    .from('tenant_users')
    .delete()
    .eq('id', targetStaff.id)
    .eq('tenant_id', tenantId);

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 });
  }

  const { count: remainingTenantLinks } = await adminClient
    .from('tenant_users')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', targetStaff.user_id);

  const { count: remainingMemberships } = await adminClient
    .from('memberships')
    .select('id', { head: true, count: 'exact' })
    .eq('user_id', targetStaff.user_id);

  if ((remainingTenantLinks || 0) === 0 && (remainingMemberships || 0) === 0) {
    await adminClient.auth.admin.deleteUser(targetStaff.user_id);
  }

  return NextResponse.json({ removed: true });
}
