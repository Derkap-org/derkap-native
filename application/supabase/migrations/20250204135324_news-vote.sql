alter table "public"."group" enable row level security;

alter table "public"."vote" enable row level security;

create policy "Allow member of group to leave - delete row"
on "public"."group_profile"
as permissive
for delete
to public
using ((( SELECT auth.uid() AS uid) = profile_id));


create policy "vote_group_policy"
on "public"."vote"
as permissive
for all
to public
using ((EXISTS ( SELECT 1
   FROM (group_profile gp
     JOIN challenge c ON ((c.group_id = gp.group_id)))
  WHERE ((gp.profile_id = auth.uid()) AND (c.id = vote.challenge_id)))));



