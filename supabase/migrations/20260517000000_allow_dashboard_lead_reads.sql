-- Plano Certo - dashboard lead summaries
-- Allows the current frontend dashboard to read lead rows with the publishable key.
-- Revisit this when authenticated organization-scoped RLS is introduced.

grant select on public.leads to anon, authenticated;

drop policy if exists "anon read leads dashboard" on public.leads;
create policy "anon read leads dashboard"
on public.leads
for select
to anon
using (true);
