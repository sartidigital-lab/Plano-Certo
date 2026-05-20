-- Plano Certo - inbox conversation access
-- Temporary frontend access for the operational prototype.
-- Replace with organization-scoped authenticated policies before real multi-tenant use.

grant select, insert, update on public.whatsapp_conversations to anon, authenticated;
grant select, insert, update on public.messages to anon, authenticated;

drop policy if exists "anon read whatsapp conversations" on public.whatsapp_conversations;
create policy "anon read whatsapp conversations"
on public.whatsapp_conversations
for select
to anon
using (true);

drop policy if exists "anon create whatsapp conversations" on public.whatsapp_conversations;
create policy "anon create whatsapp conversations"
on public.whatsapp_conversations
for insert
to anon
with check (true);

drop policy if exists "anon update whatsapp conversations" on public.whatsapp_conversations;
create policy "anon update whatsapp conversations"
on public.whatsapp_conversations
for update
to anon
using (true)
with check (true);

drop policy if exists "anon read inbox messages" on public.messages;
create policy "anon read inbox messages"
on public.messages
for select
to anon
using (true);

drop policy if exists "anon create inbox messages" on public.messages;
create policy "anon create inbox messages"
on public.messages
for insert
to anon
with check (true);

drop policy if exists "authenticated manage whatsapp conversations" on public.whatsapp_conversations;
create policy "authenticated manage whatsapp conversations"
on public.whatsapp_conversations
for all
to authenticated
using (true)
with check (true);

drop policy if exists "authenticated manage inbox messages" on public.messages;
create policy "authenticated manage inbox messages"
on public.messages
for all
to authenticated
using (true)
with check (true);
