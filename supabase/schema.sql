begin;
create table public.koka_members (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'chef')),
  department text check (department in ('bakery', 'cakes', 'drinks', 'oriental')),
  check ((role = 'chef') = (department is not null))
);
create table public.koka_materials (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data ? 'id' and data->>'id' = id),
  revision integer not null default 0
);
create table public.koka_recipes (
  id text primary key,
  data jsonb not null check (jsonb_typeof(data) = 'object' and data ? 'id' and data->>'id' = id
    and data ? 'dept' and data->>'dept' in ('bakery','cakes','drinks','oriental')
    and data ? 'status' and data->>'status' in ('مسودة','بانتظار الاعتماد','معتمدة','تحتاج تعديل')),
  revision integer not null default 0
);
alter table public.koka_members enable row level security;
alter table public.koka_materials enable row level security;
alter table public.koka_recipes enable row level security;
revoke all on public.koka_members, public.koka_materials, public.koka_recipes from anon, authenticated;
grant select on public.koka_members, public.koka_materials, public.koka_recipes to authenticated;
grant insert (id, data), update (data) on public.koka_materials, public.koka_recipes to authenticated;

create policy membership_self on public.koka_members for select to authenticated
  using (user_id = (select auth.uid()));
create policy material_read on public.koka_materials for select to authenticated
  using (exists (select 1 from public.koka_members));
create policy recipe_read on public.koka_recipes for select to authenticated
  using (exists (select 1 from public.koka_members));
create policy material_add on public.koka_materials for insert to authenticated
  with check (exists (select 1 from public.koka_members where role='owner'));
create policy material_edit on public.koka_materials for update to authenticated
  using (exists (select 1 from public.koka_members where role='owner'))
  with check (exists (select 1 from public.koka_members where role='owner'));
create policy recipe_add on public.koka_recipes for insert to authenticated
  with check (data->>'status'='مسودة' and exists (select 1 from public.koka_members where role='owner'));
create policy recipe_edit on public.koka_recipes for update to authenticated
  using (exists (select 1 from public.koka_members where role='owner' or department=data->>'dept'))
  with check (exists (select 1 from public.koka_members where role='owner' or department=data->>'dept'));

create function public.koka_guard_change() returns trigger
language plpgsql security invoker set search_path = '' as $$
declare
  member_role text;
  member_department text;
  target_status text;
begin
  if tg_op = 'UPDATE' then
    new.revision := old.revision + 1;
  end if;
  if tg_table_name = 'koka_materials' then return new; end if;
  select role, department into member_role, member_department
    from public.koka_members where user_id = (select auth.uid());
  target_status := new.data->>'status';
  if member_role = 'owner' then
    if target_status = 'مسودة' then
      new.data := new.data - 'review';
      return new;
    end if;
    if tg_op = 'UPDATE' and target_status = 'بانتظار الاعتماد'
      and old.data->>'status' in ('مسودة','تحتاج تعديل')
      and (old.data - 'status' - 'review') = (new.data - 'status' - 'review') then
      new.data := new.data - 'review';
      return new;
    end if;
  elsif member_role = 'chef' and tg_op = 'UPDATE' then
    if member_department = old.data->>'dept' and old.data->>'status'='بانتظار الاعتماد'
      and target_status in ('معتمدة','تحتاج تعديل')
      and (old.data - 'status' - 'review') = (new.data - 'status' - 'review') then
      new.data := jsonb_set(new.data,'{review}',jsonb_build_object(
        'department',member_department,'by',auth.uid(),'date',now()));
      return new;
    end if;
  end if;
  raise exception 'غير مصرح بتغيير الوصفة أو حالة الاعتماد' using errcode='42501';
end;
$$;
revoke all on function public.koka_guard_change() from public, anon, authenticated;
create trigger koka_material_revision before update on public.koka_materials
  for each row execute function public.koka_guard_change();
create trigger koka_recipe_guard before insert or update on public.koka_recipes
  for each row execute function public.koka_guard_change();
commit;
