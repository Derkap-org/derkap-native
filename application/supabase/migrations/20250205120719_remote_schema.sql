alter table "public"."notification_subscription" drop column "subscription";

alter table "public"."notification_subscription" enable row level security;

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.notify_new_encrypted_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  PERFORM
    net.http_post(
      url := 'https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-new-post',
      headers := json_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzc0ODMxOSwiZXhwIjoyMDMzMzI0MzE5fQ.eT0_E89SJcXMMxwiQBxr0IwIhASgms4BDNRVz3CZ_xc'
      )::jsonb,
      body := json_build_object(
        'post_id', NEW.id,
        'challenge_id', NEW.challenge_id,
        'sender_id', NEW.profile_id
      )::jsonb
    );

  RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.notify_new_group_member()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  PERFORM net.http_post(
    url := 'https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-new-group-member',
    headers := json_build_object(
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzc0ODMxOSwiZXhwIjoyMDMzMzI0MzE5fQ.eT0_E89SJcXMMxwiQBxr0IwIhASgms4BDNRVz3CZ_xc'
    )::jsonb,
    body := json_build_object(
      'group_id', NEW.group_id,
      'sender_id', NEW.profile_id
    )::jsonb
  );

  RETURN NEW;
END;
$function$
;

create policy "Service role can access all rows"
on "public"."notification_subscription"
as permissive
for all
to service_role
using (true);


create policy "Users can upsert their own notification subscription"
on "public"."notification_subscription"
as permissive
for all
to authenticated
using ((auth.uid() = user_id))
with check ((auth.uid() = user_id));


CREATE TRIGGER trigger_notify_new_encrypted_post AFTER INSERT ON public.encrypted_post FOR EACH ROW EXECUTE FUNCTION notify_new_encrypted_post();

CREATE TRIGGER trigger_notify_new_group_member AFTER INSERT ON public.group_profile FOR EACH ROW EXECUTE FUNCTION notify_new_group_member();


