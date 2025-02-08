create extension postgis with schema extensions;

-- user roles

create type public.app_role as enum ('editor', 'viewer', 'street', 'spotter');

create table public.user_roles (
  user_id uuid references auth.users on delete cascade not null,
  role app_role not null,
  primary key (user_id, role)
);

create or replace function public.assign_default_role()
returns trigger as $$
begin
  insert into public.user_roles (user_id, role)
  values (new.id, 'street');
  return new;
end;
$$ language plpgsql;

create or replace trigger after_user_created after insert on auth.users for each row execute function public.assign_default_role();

create or replace function public.has_role(allowed_roles text[])
returns boolean as $$
begin
  return (auth.jwt() ->> 'user_role')::text = any (allowed_roles);
end;
$$ language plpgsql;

create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
stable
as $$
  declare
    claims jsonb;
    user_role public.app_role;
  begin
    select role into user_role from public.user_roles where user_id = (event->>'user_id')::uuid;
    claims := event->'claims';
    if user_role is not null then
      -- set the claim
      claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    else
      claims := jsonb_set(claims, '{user_role}', 'viewer');
    end if;
    event := jsonb_set(event, '{claims}', claims);
    return event;
  end;
$$;

grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
revoke execute on function public.custom_access_token_hook from authenticated, anon, public;
grant all on table public.user_roles to supabase_auth_admin;
revoke all on table public.user_roles from authenticated, anon, public;

alter table public.user_roles enable row level security;
create policy "select user_roles" on public.user_roles as permissive for select to supabase_auth_admin using (true);
create policy "insert user_roles" on public.user_roles as permissive for insert to supabase_auth_admin with check (true);

-- markers

create type marker_state_enum as enum ('new', 'marked', 'done');

create table markers (
  id uuid primary key,
  name text not null,
  description text not null,
  state marker_state_enum not null,
  location geometry(point, 4326) not null,
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);

create index idx_markers_location on markers using gist (location);

alter table markers enable row level security;
create policy "select marker" on public.markers for select to authenticated using (true);
create policy "insert marker" on public.markers for insert to authenticated with check (
    public.has_role(array['street', 'editor'])
    or exists (select 1 from public.markers p where p.id = markers.id));
create policy "update marker" on public.markers for update to authenticated using (public.has_role(array['street', 'editor', 'spotter'])) with check (true);
create policy "delete marker" on public.markers for delete to authenticated using (public.has_role(array['editor']));

create or replace function cls_markers()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
  elsif tg_op = 'UPDATE' then
    if current_user in ('authenticated', 'anon') then
      new.id := old.id;
      new.created_at := old.created_at;
      if old.created_at < now() - interval '1 hour' then
        new.location := old.location;
      end if;
    end if;
    new.updated_at := now();
  end if;
  return new;
end;
$$ language plpgsql;
create or replace trigger cls_markers before insert or update on public.markers for each row execute function cls_markers();

create or replace function markers_in_view(min_lng float, min_lat float, max_lng float, max_lat float, limit_rows int DEFAULT 200)
returns table (
  id markers.id % type,
  name markers.name % type, 
  description markers.description % type, 
  state markers.state % type,
  location markers.location % type,
  created_at markers.created_at % type,
  updated_at markers.updated_at % type
)
language sql as $$
  select
    id,
    name,
    description,
    state,
    location,
    created_at,
    updated_at
  from markers
  where location && st_setsrid(st_makebox2d(st_point(min_lng, min_lat), st_point(max_lng, max_lat)), 4326)
  order by id
  limit limit_rows
$$;

create or replace function markers_nearby(lng float, lat float)
returns table (
  id markers.id % type, 
  name markers.name % type, 
  description markers.description % type, 
  location markers.location % type,
  distance float
)
language sql as $$
  select 
    id, 
    name, 
    description, 
    location,
    st_distance(location, st_point(lng, lat)) as distance
  from markers
  order by location <-> st_point(lng, lat)
$$;

-- drawings

create table drawings (
  id text primary key,
  name text not null,
  description text not null,
  properties jsonb not null,      
  geom geometry not null,
  tags text[] default '{}',
  created_at timestamp default now() not null,
  updated_at timestamp default now() not null
);

create index idx_drawings_tags on drawings using gin (tags);

alter table public.drawings enable row level security;
create policy "select drawing" on public.drawings for select to authenticated using (true);
create policy "insert drawing" on public.drawings for insert to authenticated with check (public.has_role(array['editor']));
create policy "update drawing" on public.drawings for update to authenticated using (public.has_role(array['editor'])) with check (true);
create policy "delete drawing" on public.drawings for delete to authenticated using (public.has_role(array['editor']));

create or replace function cls_drawings()
returns trigger as $$
begin
  if tg_op = 'INSERT' then
    new.created_at := now();
    new.updated_at := now();
  elsif tg_op = 'UPDATE' then
    if current_user in ('authenticated', 'anon') then
      new.id := old.id;
      new.created_at := old.created_at;
    end if;
    new.updated_at := now();
  end if;
  if new.tags is distinct from old.tags then
    insert into tags (tag) select distinct unnest(new.tags) on conflict (tag) do nothing;
  end if;
  return new;
end;
$$ language plpgsql;
create or replace trigger cls_drawings before insert or update on public.drawings for each row execute function cls_drawings();

-- tags

create table tags (
  tag text primary key
);

alter publication supabase_realtime add table tags;

alter table public.tags enable row level security;
create policy "select tags" on public.tags for select to authenticated using (true);
create policy "insert tags" on public.tags for insert to authenticated with check (public.has_role(array['editor']));
create policy "update tags" on public.tags for update to authenticated using (public.has_role(array['editor'])) with check (true);
create policy "delete tags" on public.tags for delete to authenticated using (public.has_role(array['editor']));

-- audits

create table audit_logs (
  id bigserial primary key,
  table_name text not null,
  operation text not null,
  changed_data jsonb not null,
  user_id uuid,
  session_id uuid,
  timestamp timestamp default current_timestamp
);

alter table public.audit_logs enable row level security;
create policy "select audit_logs" on public.audit_logs for select to authenticated using (public.has_role(array['editor']));

create or replace function log_table_changes()
returns trigger as $$
declare
  user_id uuid;
  session_id uuid;
  changed_data jsonb;
begin
  user_id := current_setting('request.jwt.claims', true)::jsonb->>'sub';
  session_id := current_setting('request.jwt.claims', true)::jsonb->>'session_id';
  changed_data := row_to_json(case when tg_op = 'DELETE' then old else new end);

  insert into audit_logs (table_name, operation, changed_data, user_id, session_id)
  values (tg_table_name, tg_op, changed_data, user_id, session_id);

  return new;
end;
$$ language plpgsql security definer;

create or replace trigger markers_changed after insert or update or delete on markers for each row execute function log_table_changes();
create or replace trigger drawings_changed after insert or update or delete on drawings for each row execute function log_table_changes();
