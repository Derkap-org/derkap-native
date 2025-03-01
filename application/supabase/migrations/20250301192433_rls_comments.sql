alter table "public"."comment" enable row level security;

create policy "insert_comment_if_group_member"
on "public"."comment"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM ((group_profile gp
     JOIN challenge c ON ((c.group_id = gp.group_id)))
     JOIN post p ON ((p.challenge_id = c.id)))
  WHERE ((gp.profile_id = auth.uid()) AND (p.id = comment.post_id)))));


create policy "select_comment_if_group_member"
on "public"."comment"
as permissive
for select
to public
using ((EXISTS ( SELECT 1
   FROM ((group_profile gp
     JOIN challenge c ON ((c.group_id = gp.group_id)))
     JOIN post p ON ((p.challenge_id = c.id)))
  WHERE ((gp.profile_id = auth.uid()) AND (p.id = comment.post_id)))));


create policy "update_delete_own_comment"
on "public"."comment"
as permissive
for all
to public
using ((creator_id = auth.uid()));



