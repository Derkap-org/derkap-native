create sequence "public"."app_version_id_seq";

create table "public"."app_version" (
    "id" integer not null default nextval('app_version_id_seq'::regclass),
    "version" text not null,
    "min_supported_version" text not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "notes" text
);


alter table "public"."app_version" enable row level security;

alter sequence "public"."app_version_id_seq" owned by "public"."app_version"."id";

CREATE UNIQUE INDEX app_version_pkey ON public.app_version USING btree (id);

alter table "public"."app_version" add constraint "app_version_pkey" PRIMARY KEY using index "app_version_pkey";

create policy "Public can read app version"
on "public"."app_version"
as permissive
for select
to public
using (true);



