import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { entity_name, entity_id, action, old_values, new_values } = await req.json();

    await base44.entities.AuditLog.create({
      entity_name,
      entity_id,
      action,
      changed_by: user.email,
      old_values: old_values || null,
      new_values: new_values || null,
      timestamp: new Date().toISOString()
    });

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});