alter table "public"."app_ maintenance" add column "maintenance_active_android" boolean;

alter table "public"."app_version" add column "min_supported_version_android" text;

alter table "public"."app_version" add column "version_android" text;


