drop trigger if exists "trigger_notify_new_post" on "public"."post";

alter table "public"."comment" drop constraint "comment_derkap_id_fkey";

alter table "public"."comment" add constraint "comment_derkap_id_fkey" FOREIGN KEY (derkap_id) REFERENCES derkap(id) ON UPDATE CASCADE ON DELETE CASCADE not valid;

alter table "public"."comment" validate constraint "comment_derkap_id_fkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.notify_new_post()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$BEGIN
  PERFORM
    net.http_post(
      url := 'https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-new-post',
      headers := json_build_object(
        'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzc0ODMxOSwiZXhwIjoyMDMzMzI0MzE5fQ.eT0_E89SJcXMMxwiQBxr0IwIhASgms4BDNRVz3CZ_xc'
      )::jsonb,
      body := json_build_object(
        'allowed_user_id', NEW.allowed_user_id
        'derkap_id', NEW.derkap_id
      )::jsonb
    );

  RETURN NEW;
END;$function$
;

CREATE TRIGGER webhook_notify_new_post AFTER INSERT ON public.derkap_allowed_users FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-new-post', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc3NDgzMTksImV4cCI6MjAzMzMyNDMxOX0.vnNh1kwokAi43XuAArlkyhlAFxDuKVzYkPKOvnOoRp4"}', '{}', '5000');

CREATE TRIGGER webhook_notify_accept_friend AFTER UPDATE ON public.friends_request FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-accept-friend', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc3NDgzMTksImV4cCI6MjAzMzMyNDMxOX0.vnNh1kwokAi43XuAArlkyhlAFxDuKVzYkPKOvnOoRp4"}', '{}', '5000');

CREATE TRIGGER webhook_notify_new_friend_request AFTER INSERT ON public.friends_request FOR EACH ROW EXECUTE FUNCTION supabase_functions.http_request('https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-new-friend', 'POST', '{"Content-type":"application/json","Authorization":"Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTc3NDgzMTksImV4cCI6MjAzMzMyNDMxOX0.vnNh1kwokAi43XuAArlkyhlAFxDuKVzYkPKOvnOoRp4"}', '{}', '5000');


