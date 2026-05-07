import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();

    const auditLog = {
      entity_name: body.entity_name,
      entity_id: body.entity_id,
      action: body.action,
      changed_by: user.email,
      old_values: body.old_values || {},
      new_values: body.new_values || {},
      timestamp: new Date().toISOString()
    };

    await base44.entities.AuditLog.create(auditLog);

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});