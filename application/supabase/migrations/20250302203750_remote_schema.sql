

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


CREATE EXTENSION IF NOT EXISTS "pg_net" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgsodium" WITH SCHEMA "pgsodium";






COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "http" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."challenge_status" AS ENUM (
    'posting',
    'voting',
    'ended'
);


ALTER TYPE "public"."challenge_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cron_schedule"() RETURNS "void"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    new_challenge RECORD;
BEGIN
    -- Désactiver le défi actuellement actif
    UPDATE challenge
    SET is_active = false
    WHERE is_active = true;

    -- Sélectionner un nouveau défi qui n'a pas encore été utilisé et l'activer
    UPDATE challenge
    SET is_active = true, 
        -- is_already_used = true,  
        date_used = CURRENT_DATE
    WHERE id = (
        SELECT id
        FROM challenge
        WHERE is_already_used = false
        ORDER BY RANDOM()
        LIMIT 1
    )
    RETURNING * INTO new_challenge;

    -- Appeler la fonction Edge avec les données du défi en utilisant PERFORM
    PERFORM http_post(
        'https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/sendChallengeNotification',
        json_build_object('title', new_challenge.title, 'message', new_challenge.description)::text,
        'application/json'
    );

    -- Log optionnel pour déboguer
    RAISE NOTICE 'Notification sent for new challenge: %', new_challenge.title;
END;
$$;


ALTER FUNCTION "public"."cron_schedule"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_unique_invite_code"() RETURNS "text"
    LANGUAGE "plpgsql"
    AS $$DECLARE
    new_code TEXT;
    exists BOOLEAN;
BEGIN
    LOOP
        -- Generate a random 10-character alphanumeric code
        new_code := upper(substring(md5(random()::text) from 1 for 10));

        -- Check if the code already exists in the "groups" table
        SELECT EXISTS (SELECT 1 FROM public.group WHERE invite_code = new_code) INTO exists;

        -- If the code is unique, exit the loop
        IF NOT exists THEN
            EXIT;
        END IF;
    END LOOP;

    RETURN new_code;
END;$$;


ALTER FUNCTION "public"."generate_unique_invite_code"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."group" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "name" "text" NOT NULL,
    "img_url" "text",
    "invite_code" "text" DEFAULT ''::"text",
    "creator_id" "uuid" DEFAULT "auth"."uid"()
);


ALTER TABLE "public"."group" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_by_invite_code"("p_invite_code" "text") RETURNS SETOF "public"."group"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
begin
  -- Return the group that matches the invite code
  -- The security definer allows this function to bypass RLS
  return query
  select *
  from "group"
  where "group".invite_code = p_invite_code
  limit 1;
end;
$$;


ALTER FUNCTION "public"."get_group_by_invite_code"("p_invite_code" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_group_user_count"("group_id_param" bigint) RETURNS integer
    LANGUAGE "plpgsql"
    AS $$
DECLARE
    user_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO user_count
    FROM group_profile
    WHERE group_id = group_id_param;
    
    RETURN user_count;
END;
$$;


ALTER FUNCTION "public"."get_group_user_count"("group_id_param" bigint) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_latest_challenge_status"("group_ids" bigint[]) RETURNS TABLE("group_id" bigint, "status" "public"."challenge_status")
    LANGUAGE "plpgsql"
    AS $$
BEGIN
  RETURN QUERY
  WITH latest_challenges AS (
    SELECT 
      c.group_id,  -- Fully qualify the column
      c.status,
      ROW_NUMBER() OVER (PARTITION BY c.group_id ORDER BY c.created_at DESC) AS rn
    FROM 
      challenge c  -- Alias the table to avoid ambiguity
    WHERE 
      c.group_id = ANY(group_ids)
  )
  SELECT 
    lc.group_id,  -- Fully qualify the column
    lc.status
  FROM 
    latest_challenges lc  -- Alias the CTE to avoid ambiguity
  WHERE 
    lc.rn = 1;  -- Fully qualify the rn column
END;
$$;


ALTER FUNCTION "public"."get_latest_challenge_status"("group_ids" bigint[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$begin
  insert into public.profile (id,email,username)
  values (new.id, new.email, new.raw_user_meta_data->>'username');
  return new;
end;$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_backend_of_new_challenge"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW.is_active = true AND NEW.notification_sent = false THEN
        -- Appelle une fonction externe (que nous allons configurer dans Supabase) pour notifier le backend
        PERFORM pg_notify('new_challenge', json_build_object(
            'title', NEW.title, 
            'description', NEW.description
        )::text);

        -- Marque la notification comme envoyée
        NEW.notification_sent := true;
    END IF;

    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_backend_of_new_challenge"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_challenge_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  -- Determine if this is a new challenge or a status update
  IF TG_OP = 'INSERT' THEN
    PERFORM
      net.http_post(
        url := 'https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-challenge-update',
        headers := json_build_object('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzc0ODMxOSwiZXhwIjoyMDMzMzI0MzE5fQ.eT0_E89SJcXMMxwiQBxr0IwIhASgms4BDNRVz3CZ_xc')::jsonb,
        body := json_build_object(
          'challenge_id', NEW.id,
          'group_id', NEW.group_id,
          'event_type', 'new_challenge',
          'new_status', NEW.status
        )::jsonb
      );
  ELSIF TG_OP = 'UPDATE' AND OLD.status <> NEW.status THEN
    PERFORM
      net.http_post(
        url := 'https://hrktxqpsqbjnockggnic.supabase.co/functions/v1/notify-challenge-update',
        headers := json_build_object('Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imhya3R4cXBzcWJqbm9ja2dnbmljIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxNzc0ODMxOSwiZXhwIjoyMDMzMzI0MzE5fQ.eT0_E89SJcXMMxwiQBxr0IwIhASgms4BDNRVz3CZ_xc')::jsonb,
        body := json_build_object(
          'challenge_id', NEW.id,
          'group_id', NEW.group_id,
          'event_type', 'status_change',
          'old_status', OLD.status,
          'new_status', NEW.status
        )::jsonb
      );
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."notify_challenge_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_encrypted_post"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_new_encrypted_post"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_group_member"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_new_group_member"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."notify_new_post"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
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
$$;


ALTER FUNCTION "public"."notify_new_post"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."set_invite_code"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$BEGIN
    -- If invite_code is not provided, generate a new one
    IF NEW.invite_code IS NULL THEN
        NEW.invite_code := generate_unique_invite_code();
    END IF;

    RETURN NEW;
END;$$;


ALTER FUNCTION "public"."set_invite_code"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_challenge_status_to_ended"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE
  challenge_group_id BIGINT;
  member_count INTEGER;
  vote_count INTEGER;
  current_status text;
BEGIN
  -- Get the group ID and current status of the challenge
  SELECT c.group_id, c.status::text INTO challenge_group_id, current_status
  FROM challenge c
  WHERE c.id = NEW.challenge_id;

  -- Count the number of active members in the group
  SELECT COUNT(*) INTO member_count
  FROM group_profile gp
  WHERE gp.group_id = challenge_group_id
  AND gp.profile_id IS NOT NULL;

  -- Count the number of DISTINCT voters for this challenge
  SELECT COUNT(DISTINCT v.user_id) INTO vote_count
  FROM vote v
  WHERE v.challenge_id = NEW.challenge_id;

  -- If the vote count equals the member count, update the challenge status to 'ended'
  IF vote_count >= member_count THEN
    UPDATE challenge
    SET status = 'ended'::challenge_status
    WHERE id = NEW.challenge_id
    AND status = 'voting'::challenge_status;
    
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_challenge_status_to_ended"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_challenge_status_to_voting"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
    -- Get the challenge and its associated group information
    WITH challenge_info AS (
        SELECT 
            c.id AS challenge_id,
            c.group_id,
            c.status,
            (
                SELECT COUNT(*)
                FROM group_profile gp
                WHERE gp.group_id = c.group_id
            ) AS total_members,
            (
                SELECT COUNT(DISTINCT p.profile_id)
                FROM post p
                WHERE p.challenge_id = c.id
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
$$;


ALTER FUNCTION "public"."update_challenge_status_to_voting"() OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."challenge" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "description" "text" NOT NULL,
    "creator_id" "uuid",
    "group_id" bigint NOT NULL,
    "status" "public"."challenge_status" NOT NULL,
    "base_key" "text"
);


ALTER TABLE "public"."challenge" OWNER TO "postgres";


ALTER TABLE "public"."challenge" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."challenge_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."group_profile" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "profile_id" "uuid",
    "group_id" bigint NOT NULL
);


ALTER TABLE "public"."group_profile" OWNER TO "postgres";


ALTER TABLE "public"."group_profile" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."group_profile_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE "public"."group" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."groupe_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."notification_subscription" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "expo_push_token" "text"
);


ALTER TABLE "public"."notification_subscription" OWNER TO "postgres";


ALTER TABLE "public"."notification_subscription" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."notification_subscription_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."post" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "file_path" "text",
    "challenge_id" bigint,
    "profile_id" "uuid",
    "caption" "text"
);


ALTER TABLE "public"."post" OWNER TO "postgres";


ALTER TABLE "public"."post" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."post_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



CREATE TABLE IF NOT EXISTS "public"."profile" (
    "id" "uuid" NOT NULL,
    "username" "text" NOT NULL,
    "avatar_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "email" "text" NOT NULL,
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profile" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vote" (
    "id" bigint NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_id" "uuid" DEFAULT "auth"."uid"() NOT NULL,
    "post_id" bigint NOT NULL,
    "challenge_id" bigint NOT NULL
);


ALTER TABLE "public"."vote" OWNER TO "postgres";


ALTER TABLE "public"."vote" ALTER COLUMN "id" ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME "public"."vote_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);



ALTER TABLE ONLY "public"."challenge"
    ADD CONSTRAINT "challenge_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group_profile"
    ADD CONSTRAINT "group_profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "groupe_invite_code_key" UNIQUE ("invite_code");



ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "groupe_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_subscription"
    ADD CONSTRAINT "notification_subscription_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."notification_subscription"
    ADD CONSTRAINT "notification_subscription_user_id_key" UNIQUE ("user_id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_challenge_id_profile_id_key" UNIQUE ("challenge_id", "profile_id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "unique_user_challenge_vote" UNIQUE ("user_id", "challenge_id");



ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "vote_pkey" PRIMARY KEY ("id");



CREATE OR REPLACE TRIGGER "auto_update_challenge_status_to_ended" AFTER INSERT ON "public"."vote" FOR EACH ROW EXECUTE FUNCTION "public"."update_challenge_status_to_ended"();



CREATE OR REPLACE TRIGGER "auto_update_challenge_status_to_voting" AFTER INSERT OR UPDATE ON "public"."post" FOR EACH ROW EXECUTE FUNCTION "public"."update_challenge_status_to_voting"();



CREATE OR REPLACE TRIGGER "on_challenge_changed" AFTER INSERT OR UPDATE ON "public"."challenge" FOR EACH ROW EXECUTE FUNCTION "public"."notify_challenge_update"();



CREATE OR REPLACE TRIGGER "trigger_notify_new_group_member" AFTER INSERT ON "public"."group_profile" FOR EACH ROW EXECUTE FUNCTION "public"."notify_new_group_member"();



CREATE OR REPLACE TRIGGER "trigger_notify_new_post" AFTER INSERT ON "public"."post" FOR EACH ROW EXECUTE FUNCTION "public"."notify_new_post"();



CREATE OR REPLACE TRIGGER "trigger_set_invite_code" BEFORE INSERT ON "public"."group" FOR EACH ROW EXECUTE FUNCTION "public"."set_invite_code"();



ALTER TABLE ONLY "public"."challenge"
    ADD CONSTRAINT "challenge_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."challenge"
    ADD CONSTRAINT "challenge_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group"
    ADD CONSTRAINT "group_creator_id_fkey" FOREIGN KEY ("creator_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."group_profile"
    ADD CONSTRAINT "group_profile_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."group"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."group_profile"
    ADD CONSTRAINT "group_profile_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE SET NULL;



ALTER TABLE ONLY "public"."notification_subscription"
    ADD CONSTRAINT "notification_subscription_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id");



ALTER TABLE ONLY "public"."post"
    ADD CONSTRAINT "post_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "public"."profile"("id");



ALTER TABLE ONLY "public"."profile"
    ADD CONSTRAINT "profile_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "vote_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "public"."challenge"("id") ON UPDATE CASCADE ON DELETE CASCADE;



ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "vote_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."post"("id");



ALTER TABLE ONLY "public"."vote"
    ADD CONSTRAINT "vote_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profile"("id") ON UPDATE CASCADE ON DELETE CASCADE;



CREATE POLICY "Allow group member to read challenges" ON "public"."challenge" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE (("gp"."group_id" = "challenge"."group_id") AND ("gp"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Allow group member to update group" ON "public"."group" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE (("gp"."group_id" = "group"."id") AND ("gp"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE (("gp"."group_id" = "group"."id") AND ("gp"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Allow group member, or creator to read" ON "public"."group" FOR SELECT USING (((EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE (("gp"."group_id" = "group"."id") AND ("gp"."profile_id" = "auth"."uid"())))) OR ("creator_id" = "auth"."uid"()) OR (EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE ("gp"."group_id" = "group"."id")))));



CREATE POLICY "Allow member of group to leave - delete row" ON "public"."group_profile" FOR DELETE USING ((( SELECT "auth"."uid"() AS "uid") = "profile_id"));



CREATE POLICY "Enable delete for users based on user_id" ON "public"."profile" FOR DELETE USING (("auth"."uid"() = "id"));



CREATE POLICY "Enable insert for authenticated users only" ON "public"."group" FOR INSERT WITH CHECK (true);



CREATE POLICY "Enable insert for authenticated users only" ON "public"."group_profile" FOR INSERT TO "authenticated" WITH CHECK (true);



CREATE POLICY "Enable insert for users based on creator_id" ON "public"."challenge" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "creator_id"));



CREATE POLICY "Enable read for authenticated users only" ON "public"."group_profile" FOR SELECT TO "authenticated" USING (true);



CREATE POLICY "Enable update for users based on created_id" ON "public"."challenge" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE (("gp"."group_id" = "challenge"."group_id") AND ("gp"."profile_id" = "auth"."uid"()))))) WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."group_profile" "gp"
  WHERE (("gp"."group_id" = "challenge"."group_id") AND ("gp"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Public profile are viewable by everyone." ON "public"."profile" FOR SELECT USING (true);



CREATE POLICY "Service role can access all rows" ON "public"."notification_subscription" TO "service_role" USING (true);



CREATE POLICY "Users can insert their own profile." ON "public"."profile" FOR INSERT WITH CHECK (("auth"."uid"() = "id"));



CREATE POLICY "Users can only insert their own posts if they are in the challe" ON "public"."post" FOR INSERT WITH CHECK ((("profile_id" = "auth"."uid"()) AND ("challenge_id" IN ( SELECT "challenge"."id"
   FROM ("public"."challenge"
     JOIN "public"."group_profile" ON (("challenge"."group_id" = "group_profile"."group_id")))
  WHERE ("group_profile"."profile_id" = "auth"."uid"())))));



CREATE POLICY "Users can update own profile." ON "public"."profile" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can upsert their own notification subscription" ON "public"."notification_subscription" TO "authenticated" USING (("auth"."uid"() = "user_id")) WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view posts from challenges in their groups" ON "public"."post" FOR SELECT USING (("challenge_id" IN ( SELECT "challenge"."id"
   FROM ("public"."challenge"
     JOIN "public"."group_profile" ON (("challenge"."group_id" = "group_profile"."group_id")))
  WHERE ("group_profile"."profile_id" = "auth"."uid"()))));



ALTER TABLE "public"."challenge" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."group_profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."notification_subscription" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."post" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profile" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vote" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "vote_group_policy" ON "public"."vote" USING ((EXISTS ( SELECT 1
   FROM ("public"."group_profile" "gp"
     JOIN "public"."challenge" "c" ON (("c"."group_id" = "gp"."group_id")))
  WHERE (("gp"."profile_id" = "auth"."uid"()) AND ("c"."id" = "vote"."challenge_id")))));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";





GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";













































































































































































































































GRANT ALL ON FUNCTION "public"."cron_schedule"() TO "anon";
GRANT ALL ON FUNCTION "public"."cron_schedule"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."cron_schedule"() TO "service_role";



GRANT ALL ON FUNCTION "public"."generate_unique_invite_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."generate_unique_invite_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."generate_unique_invite_code"() TO "service_role";



GRANT ALL ON TABLE "public"."group" TO "anon";
GRANT ALL ON TABLE "public"."group" TO "authenticated";
GRANT ALL ON TABLE "public"."group" TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_by_invite_code"("p_invite_code" "text") TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_by_invite_code"("p_invite_code" "text") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_by_invite_code"("p_invite_code" "text") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_group_user_count"("group_id_param" bigint) TO "anon";
GRANT ALL ON FUNCTION "public"."get_group_user_count"("group_id_param" bigint) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_group_user_count"("group_id_param" bigint) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_latest_challenge_status"("group_ids" bigint[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_latest_challenge_status"("group_ids" bigint[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_latest_challenge_status"("group_ids" bigint[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_backend_of_new_challenge"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_backend_of_new_challenge"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_backend_of_new_challenge"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_challenge_update"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_challenge_update"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_challenge_update"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_encrypted_post"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_encrypted_post"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_encrypted_post"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_group_member"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_group_member"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_group_member"() TO "service_role";



GRANT ALL ON FUNCTION "public"."notify_new_post"() TO "anon";
GRANT ALL ON FUNCTION "public"."notify_new_post"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."notify_new_post"() TO "service_role";



GRANT ALL ON FUNCTION "public"."set_invite_code"() TO "anon";
GRANT ALL ON FUNCTION "public"."set_invite_code"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."set_invite_code"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_challenge_status_to_ended"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_challenge_status_to_ended"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_challenge_status_to_ended"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_challenge_status_to_voting"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_challenge_status_to_voting"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_challenge_status_to_voting"() TO "service_role";


















GRANT ALL ON TABLE "public"."challenge" TO "anon";
GRANT ALL ON TABLE "public"."challenge" TO "authenticated";
GRANT ALL ON TABLE "public"."challenge" TO "service_role";



GRANT ALL ON SEQUENCE "public"."challenge_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."challenge_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."challenge_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."group_profile" TO "anon";
GRANT ALL ON TABLE "public"."group_profile" TO "authenticated";
GRANT ALL ON TABLE "public"."group_profile" TO "service_role";



GRANT ALL ON SEQUENCE "public"."group_profile_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."group_profile_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."group_profile_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."groupe_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."groupe_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."groupe_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."notification_subscription" TO "anon";
GRANT ALL ON TABLE "public"."notification_subscription" TO "authenticated";
GRANT ALL ON TABLE "public"."notification_subscription" TO "service_role";



GRANT ALL ON SEQUENCE "public"."notification_subscription_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."notification_subscription_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."notification_subscription_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."post" TO "anon";
GRANT ALL ON TABLE "public"."post" TO "authenticated";
GRANT ALL ON TABLE "public"."post" TO "service_role";



GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."post_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."profile" TO "anon";
GRANT ALL ON TABLE "public"."profile" TO "authenticated";
GRANT ALL ON TABLE "public"."profile" TO "service_role";



GRANT ALL ON TABLE "public"."vote" TO "anon";
GRANT ALL ON TABLE "public"."vote" TO "authenticated";
GRANT ALL ON TABLE "public"."vote" TO "service_role";



GRANT ALL ON SEQUENCE "public"."vote_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."vote_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."vote_id_seq" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
