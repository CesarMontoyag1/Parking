import { NextResponse } from 'next/server';
import { createAdminClient, createUserClient } from '../../../lib/supabase/server';

type BootstrapPayload = {
  accountName?: string;
  tenantName?: string;
};

export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization');

  if (!authHeader?.toLowerCase().startsWith('bearer ')) {
	return NextResponse.json({ error: 'Missing bearer token.' }, { status: 401 });
  }

  const accessToken = authHeader.slice(7);
  const body = (await request.json().catch(() => ({}))) as BootstrapPayload;

  const userClient = createUserClient(accessToken);
  const adminClient = createAdminClient();

  const {
	data: { user },
	error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
	return NextResponse.json({ error: 'Invalid session.' }, { status: 401 });
  }

  // Si ya existe membership, el usuario ya fue inicializado en el sistema.
  const { data: existingMembership, error: membershipError } = await adminClient
	.from('memberships')
	.select('id, account_id, role')
	.eq('user_id', user.id)
	.maybeSingle();

  if (membershipError) {
	return NextResponse.json({ error: membershipError.message }, { status: 500 });
  }

  if (existingMembership) {
	return NextResponse.json({ initialized: true, role: existingMembership.role });
  }

  const { data: basicPlan, error: planError } = await adminClient
	.from('plans')
	.select('id')
	.eq('code', 'basico')
	.single();

  if (planError || !basicPlan) {
	return NextResponse.json({ error: 'Plan basico not found.' }, { status: 500 });
  }

  const accountName = body.accountName?.trim() || 'Cuenta principal';
  const tenantName = body.tenantName?.trim() || 'Sede principal';

  const { data: account, error: accountError } = await adminClient
	.from('accounts')
	.insert({
	  name: accountName,
	  plan_id: basicPlan.id,
	  active: true,
	})
	.select('id')
	.single();

  if (accountError || !account) {
	return NextResponse.json({ error: accountError?.message || 'Cannot create account.' }, { status: 500 });
  }

  const { error: membershipInsertError } = await adminClient.from('memberships').insert({
	account_id: account.id,
	user_id: user.id,
	role: 'owner',
  });

  if (membershipInsertError) {
	return NextResponse.json({ error: membershipInsertError.message }, { status: 500 });
  }

  const { data: tenant, error: tenantError } = await adminClient
	.from('tenants')
	.insert({
	  account_id: account.id,
	  name: tenantName,
	  active: true,
	})
	.select('id')
	.single();

  if (tenantError || !tenant) {
	return NextResponse.json({ error: tenantError?.message || 'Cannot create tenant.' }, { status: 500 });
  }

  // Si el trigger no esta instalado, garantizamos al menos el rol admin del owner.
  const { error: tenantUserError } = await adminClient.from('tenant_users').upsert(
	{
	  tenant_id: tenant.id,
	  user_id: user.id,
	  role: 'admin',
	  active: true,
	},
	{ onConflict: 'tenant_id,user_id' }
  );

  if (tenantUserError) {
	return NextResponse.json({ error: tenantUserError.message }, { status: 500 });
  }

  return NextResponse.json({ initialized: true, role: 'admin' });
}

