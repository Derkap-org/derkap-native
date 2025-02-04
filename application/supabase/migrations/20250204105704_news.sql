drop policy "Allow group member or creator to read" on "public"."group";

alter table "public"."group" disable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.get_group_by_invite_code(p_invite_code text)
 RETURNS SETOF "group"
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
begin
  -- Return the group that matches the invite code
  -- The security definer allows this function to bypass RLS
  return query
  select *
  from "group"
  where "group".invite_code = p_invite_code
  limit 1;
end;
$function$
;

create policy "Allow group member, or creator to read"
on "public"."group"
as permissive
for select
to public
using (((EXISTS ( SELECT 1
   FROM group_profile gp
  WHERE ((gp.group_id = "group".id) AND (gp.profile_id = auth.uid())))) OR (creator_id = auth.uid()) OR (EXISTS ( SELECT 1
   FROM group_profile gp
  WHERE (gp.group_id = "group".id)))));



