create type "public"."friend_request_status" as enum ('pending', 'accepted', 'rejected');

create type "public"."friendship_status_type" as enum ('friend', 'pending_their_acceptance', 'pending_your_acceptance', 'not_friend');




create table "public"."friends_request" (
    "id" uuid not null default uuid_generate_v4(),
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "sender_id" uuid not null,
    "receiver_id" uuid not null,
    "status" friend_request_status default 'pending'::friend_request_status
);


alter table "public"."friends_request" enable row level security;

CREATE UNIQUE INDEX friends_request_pkey ON public.friends_request USING btree (id);

CREATE INDEX idx_friends_request_receiver ON public.friends_request USING btree (receiver_id);

CREATE INDEX idx_friends_request_sender ON public.friends_request USING btree (sender_id);

CREATE INDEX idx_friends_request_status ON public.friends_request USING btree (status);

CREATE UNIQUE INDEX unique_request ON public.friends_request USING btree (sender_id, receiver_id);

alter table "public"."friends_request" add constraint "friends_request_pkey" PRIMARY KEY using index "friends_request_pkey";

alter table "public"."friends_request" add constraint "different_users" CHECK ((sender_id <> receiver_id)) not valid;

alter table "public"."friends_request" validate constraint "different_users";

alter table "public"."friends_request" add constraint "friends_request_receiver_id_fkey" FOREIGN KEY (receiver_id) REFERENCES profile(id) not valid;

alter table "public"."friends_request" validate constraint "friends_request_receiver_id_fkey";

alter table "public"."friends_request" add constraint "friends_request_sender_id_fkey" FOREIGN KEY (sender_id) REFERENCES profile(id) not valid;

alter table "public"."friends_request" validate constraint "friends_request_sender_id_fkey";

alter table "public"."friends_request" add constraint "unique_request" UNIQUE using index "unique_request";

alter table "public"."friends_request" add constraint "valid_status" CHECK ((status = ANY (ARRAY['pending'::friend_request_status, 'accepted'::friend_request_status, 'rejected'::friend_request_status]))) not valid;

alter table "public"."friends_request" validate constraint "valid_status";

set check_function_bodies = off;

create or replace view "public"."friends" as  SELECT fr.created_at,
    fr.updated_at,
        CASE
            WHEN (fr.sender_id = auth.uid()) THEN fr.receiver_id
            ELSE fr.sender_id
        END AS friend_id,
    p.id AS profile_id,
    p.email,
    p.avatar_url,
    p.username
   FROM (friends_request fr
     JOIN profile p ON ((p.id =
        CASE
            WHEN (fr.sender_id = auth.uid()) THEN fr.receiver_id
            ELSE fr.sender_id
        END)))
  WHERE ((fr.status = 'accepted'::friend_request_status) AND ((fr.sender_id = auth.uid()) OR (fr.receiver_id = auth.uid())));


CREATE OR REPLACE FUNCTION public.search_users_friendship_status(p_search_username text, p_current_user_id uuid)
 RETURNS TABLE(id uuid, username text, avatar_url text, email text, friendship_status friendship_status_type)
 LANGUAGE plpgsql
AS $function$
begin
  return query
  with friendship_status as (
    select 
      case
        when fr.status = 'accepted' then 'friend'::friendship_status_type
        when fr.sender_id = p_current_user_id and fr.status = 'pending' then 'pending_their_acceptance'::friendship_status_type
        when fr.receiver_id = p_current_user_id and fr.status = 'pending' then 'pending_your_acceptance'::friendship_status_type
        else 'not_friend'::friendship_status_type
      end as status,
      case 
        when fr.sender_id = p_current_user_id then fr.receiver_id
        else fr.sender_id
      end as other_user_id
    from friends_request fr
    where (fr.sender_id = p_current_user_id or fr.receiver_id = p_current_user_id)
  )
  select 
    p.id,
    p.username,
    p.avatar_url,
    p.email,
    coalesce(fs.status, 'not_friend'::friendship_status_type) as friendship_status
  from profile p
  left join friendship_status fs on p.id = fs.other_user_id
  where 
    p.username ilike '%' || p_search_username || '%'
    and p.id != p_current_user_id
  order by 
    p.username;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;

grant delete on table "public"."friends_request" to "anon";

grant insert on table "public"."friends_request" to "anon";

grant references on table "public"."friends_request" to "anon";

grant select on table "public"."friends_request" to "anon";

grant trigger on table "public"."friends_request" to "anon";

grant truncate on table "public"."friends_request" to "anon";

grant update on table "public"."friends_request" to "anon";

grant delete on table "public"."friends_request" to "authenticated";

grant insert on table "public"."friends_request" to "authenticated";

grant references on table "public"."friends_request" to "authenticated";

grant select on table "public"."friends_request" to "authenticated";

grant trigger on table "public"."friends_request" to "authenticated";

grant truncate on table "public"."friends_request" to "authenticated";

grant update on table "public"."friends_request" to "authenticated";

grant delete on table "public"."friends_request" to "service_role";

grant insert on table "public"."friends_request" to "service_role";

grant references on table "public"."friends_request" to "service_role";

grant select on table "public"."friends_request" to "service_role";

grant trigger on table "public"."friends_request" to "service_role";

grant truncate on table "public"."friends_request" to "service_role";

grant update on table "public"."friends_request" to "service_role";

create policy "Users can create friend requests"
on "public"."friends_request"
as permissive
for insert
to authenticated
with check ((sender_id = auth.uid()));


create policy "Users can update friend requests they received"
on "public"."friends_request"
as permissive
for update
to authenticated
using ((receiver_id = auth.uid()));


create policy "Users can view their own friend requests"
on "public"."friends_request"
as permissive
for select
to authenticated
using (((sender_id = auth.uid()) OR (receiver_id = auth.uid())));


create policy "Allow member of group to leave - delete row"
on "public"."group_profile"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = profile_id));


CREATE TRIGGER update_friends_request_updated_at BEFORE UPDATE ON public.friends_request FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


