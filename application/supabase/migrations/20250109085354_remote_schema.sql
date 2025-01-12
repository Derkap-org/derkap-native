CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();


grant delete on table "storage"."s3_multipart_uploads" to "postgres";

grant insert on table "storage"."s3_multipart_uploads" to "postgres";

grant references on table "storage"."s3_multipart_uploads" to "postgres";

grant select on table "storage"."s3_multipart_uploads" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads" to "postgres";

grant update on table "storage"."s3_multipart_uploads" to "postgres";

grant delete on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant insert on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant references on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant select on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant trigger on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant truncate on table "storage"."s3_multipart_uploads_parts" to "postgres";

grant update on table "storage"."s3_multipart_uploads_parts" to "postgres";

create policy "Enable insert for authenticated users only "
on "storage"."buckets"
as permissive
for insert
to authenticated
with check (true);


create policy "Enable insert for authenticated users only 21vog_0"
on "storage"."objects"
as permissive
for insert
to authenticated
with check (true);


create policy "allow crud 21vog_0"
on "storage"."objects"
as permissive
for update
to public
using (true);


create policy "allow crud 21vog_1"
on "storage"."objects"
as permissive
for delete
to public
using (true);


create policy "allow crud 21vog_2"
on "storage"."objects"
as permissive
for insert
to public
with check (true);


create policy "allow crud 21vog_3"
on "storage"."objects"
as permissive
for select
to public
using (true);



