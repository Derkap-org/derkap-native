alter table "public"."encrypted_post" enable row level security;

create policy "Allow group member to read encrypted_posts"
on "public"."encrypted_post"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM (group_profile gp
     JOIN challenge c ON ((gp.group_id = c.group_id)))
  WHERE ((gp.profile_id = auth.uid()) AND (c.id = encrypted_post.challenge_id)))));


create policy "Allow group members to upsert posts"
on "public"."encrypted_post"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM (group_profile gp
     JOIN challenge c ON ((gp.group_id = c.group_id)))
  WHERE ((gp.profile_id = auth.uid()) AND (c.id = encrypted_post.challenge_id)))));



