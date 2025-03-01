alter table "public"."group" add column "last_activity" timestamp with time zone default now();

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.update_last_activity_on_challenge_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update "group"
  set last_activity = now()
  where id = new.group_id;
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_activity_on_comment_insert()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update "group"
  set last_activity = now()
  where id = (
    select group_id 
    from challenge 
    where id = (
      select challenge_id 
      from post 
      where id = new.post_id
    )
  );
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_activity_on_group_profile_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update "group"
  set last_activity = now()
  where id = coalesce(new.group_id, old.group_id);
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_activity_on_group_update()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.last_activity = now();
  return new;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_activity_on_post_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update "group"
  set last_activity = now()
  where id = (
    select group_id from challenge where id = coalesce(new.challenge_id, old.challenge_id)
  );
  return null;
end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_last_activity_on_vote_change()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  update "group"
  set last_activity = now()
  where id = (
    select group_id 
    from challenge 
    where id = new.challenge_id
  );
  return null;
end;
$function$
;

CREATE TRIGGER trigger_last_activity_on_challenge_insert AFTER INSERT ON public.challenge FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_challenge_change();

CREATE TRIGGER trigger_last_activity_on_challenge_update AFTER UPDATE ON public.challenge FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_challenge_change();

CREATE TRIGGER trigger_last_activity_on_comment_insert AFTER INSERT ON public.comment FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_comment_insert();

CREATE TRIGGER trigger_last_activity_on_group_update BEFORE UPDATE ON public."group" FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_group_update();

CREATE TRIGGER trigger_last_activity_on_group_profile_delete AFTER DELETE ON public.group_profile FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_group_profile_change();

CREATE TRIGGER trigger_last_activity_on_group_profile_insert AFTER INSERT ON public.group_profile FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_group_profile_change();

CREATE TRIGGER trigger_last_activity_on_post_delete AFTER DELETE ON public.post FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_post_change();

CREATE TRIGGER trigger_last_activity_on_post_insert AFTER INSERT ON public.post FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_post_change();

CREATE TRIGGER trigger_last_activity_on_post_update AFTER UPDATE ON public.post FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_post_change();

CREATE TRIGGER trigger_last_activity_on_vote_insert AFTER INSERT ON public.vote FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_vote_change();

CREATE TRIGGER trigger_last_activity_on_vote_update AFTER UPDATE ON public.vote FOR EACH ROW EXECUTE FUNCTION update_last_activity_on_vote_change();


