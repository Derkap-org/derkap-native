drop policy "Allow creator to insert allowed users" on "public"."derkap_allowed_users";

drop policy "Allow deleting allowed users if creator" on "public"."derkap_allowed_users";

alter table "public"."comment" drop constraint "comment_derkap_id_fkey";

alter table "public"."comment" add constraint "comment_derkap_id_fkey" FOREIGN KEY (derkap_id) REFERENCES derkap(id) not valid;

alter table "public"."comment" validate constraint "comment_derkap_id_fkey";

set check_function_bodies = off;

create policy "Allow creator to insert allowed users"
on "public"."derkap_allowed_users"
as permissive
for insert
to public
with check ((EXISTS ( SELECT 1
   FROM derkap d
  WHERE ((d.id = derkap_allowed_users.derkap_id) AND (d.creator_id = auth.uid())))));


create policy "Allow deleting allowed users if creator"
on "public"."derkap_allowed_users"
as permissive
for delete
to public
using ((EXISTS ( SELECT 1
   FROM derkap d
  WHERE ((d.id = derkap_allowed_users.derkap_id) AND (d.creator_id = auth.uid())))));



