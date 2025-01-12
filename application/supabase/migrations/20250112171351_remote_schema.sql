drop trigger if exists "auto_update_challenge_status_to_voting" on "public"."encrypted_post";

drop policy "Enable read access for all users" on "public"."vote";

revoke delete on table "public"."NotificationSubscription" from "anon";

revoke insert on table "public"."NotificationSubscription" from "anon";

revoke references on table "public"."NotificationSubscription" from "anon";

revoke select on table "public"."NotificationSubscription" from "anon";

revoke trigger on table "public"."NotificationSubscription" from "anon";

revoke truncate on table "public"."NotificationSubscription" from "anon";

revoke update on table "public"."NotificationSubscription" from "anon";

revoke delete on table "public"."NotificationSubscription" from "authenticated";

revoke insert on table "public"."NotificationSubscription" from "authenticated";

revoke references on table "public"."NotificationSubscription" from "authenticated";

revoke select on table "public"."NotificationSubscription" from "authenticated";

revoke trigger on table "public"."NotificationSubscription" from "authenticated";

revoke truncate on table "public"."NotificationSubscription" from "authenticated";

revoke update on table "public"."NotificationSubscription" from "authenticated";

revoke delete on table "public"."NotificationSubscription" from "service_role";

revoke insert on table "public"."NotificationSubscription" from "service_role";

revoke references on table "public"."NotificationSubscription" from "service_role";

revoke select on table "public"."NotificationSubscription" from "service_role";

revoke trigger on table "public"."NotificationSubscription" from "service_role";

revoke truncate on table "public"."NotificationSubscription" from "service_role";

revoke update on table "public"."NotificationSubscription" from "service_role";

alter table "public"."NotificationSubscription" drop constraint "NotificationSubscription_user_id_fkey";

alter table "public"."NotificationSubscription" drop constraint "notificationsubscription_pkey";

drop index if exists "public"."notificationsubscription_pkey";

drop table "public"."NotificationSubscription";

alter table "public"."group" add column "creator_id" uuid default auth.uid();

alter table "public"."group" enable row level security;

alter table "public"."group_profile" enable row level security;

alter table "public"."vote" disable row level security;

alter table "public"."group" add constraint "group_creator_id_fkey" FOREIGN KEY (creator_id) REFERENCES profile(id) ON UPDATE CASCADE ON DELETE SET NULL not valid;

alter table "public"."group" validate constraint "group_creator_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_challenge_status_to_voting()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
    -- Get the challenge and its associated group information
    WITH challenge_info AS (
        SELECT 
            c.id AS challenge_id,
            c.group_id,
            c.status,
            (
                SELECT COUNT(*)
                FROM group_member gm
                WHERE gm.group_id = c.group_id
            ) AS total_members,
            (
                SELECT COUNT(DISTINCT ep.profile_id)
                FROM encrypted_post ep
                WHERE ep.challenge_id = c.id
            ) AS total_posts
        FROM challenge c
        WHERE c.id = NEW.challenge_id
    )
    UPDATE challenge c
    SET status = 'voting'
    FROM challenge_info ci
    WHERE c.id = ci.challenge_id
    AND ci.status != 'voting'  -- Only update if not already in voting status
    AND ci.total_posts = ci.total_members;  -- Update only when all members have posted

    RETURN NEW;
END;
$function$
;

create policy "Enable update for users based on created_id"
on "public"."challenge"
as permissive
for update
to public
using ((( SELECT auth.uid() AS uid) = creator_id))
with check ((( SELECT auth.uid() AS uid) = creator_id));


create policy "Allow group member or creator to read"
on "public"."group"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_profile gp
  WHERE ((gp.group_id = "group".id) AND (gp.profile_id = auth.uid())))) OR (creator_id = auth.uid())));


create policy "Allow group member to update group"
on "public"."group"
as permissive
for update
to public
using ((EXISTS ( SELECT 1
   FROM group_profile gp
  WHERE ((gp.group_id = "group".id) AND (gp.profile_id = auth.uid())))))
with check ((EXISTS ( SELECT 1
   FROM group_profile gp
  WHERE ((gp.group_id = "group".id) AND (gp.profile_id = auth.uid())))));


create policy "Enable insert for authenticated users only"
on "public"."group"
as permissive
for insert
to public
with check (true);


create policy "Enable insert for authenticated users only"
on "public"."group_profile"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable read for authenticated users only"
on "public"."group_profile"
as permissive
for select
to authenticated
using (true);


CREATE TRIGGER auto_update_challenge_status_to_voting AFTER INSERT OR UPDATE ON public.encrypted_post FOR EACH ROW EXECUTE FUNCTION update_challenge_status_to_voting();


