


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


CREATE SCHEMA IF NOT EXISTS "public";


ALTER SCHEMA "public" OWNER TO "pg_database_owner";


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE OR REPLACE FUNCTION "public"."rls_auto_enable"() RETURNS "event_trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'pg_catalog'
    AS $$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
     IF cmd.schema_name IS NOT NULL AND cmd.schema_name IN ('public') AND cmd.schema_name NOT IN ('pg_catalog','information_schema') AND cmd.schema_name NOT LIKE 'pg_toast%' AND cmd.schema_name NOT LIKE 'pg_temp%' THEN
      BEGIN
        EXECUTE format('alter table if exists %s enable row level security', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (either system schema or not in enforced list: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$$;


ALTER FUNCTION "public"."rls_auto_enable"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."daily_routines" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "routine_date" "date",
    "intensity" character varying(20) DEFAULT 'moderate'::character varying NOT NULL,
    "status" character varying(20) DEFAULT 'planned'::character varying NOT NULL,
    "estimated_duration_minutes" integer,
    "estimated_calories" integer,
    "goals" "text"[],
    "warm_up_notes" "text",
    "cool_down_notes" "text",
    "is_active" boolean DEFAULT true NOT NULL,
    "started_at" timestamp with time zone,
    "completed_at" timestamp with time zone,
    "actual_duration_minutes" integer,
    "completion_notes" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "daily_routines_actual_duration_minutes_check" CHECK (("actual_duration_minutes" > 0)),
    CONSTRAINT "daily_routines_estimated_calories_check" CHECK (("estimated_calories" >= 0)),
    CONSTRAINT "daily_routines_estimated_duration_minutes_check" CHECK ((("estimated_duration_minutes" > 0) AND ("estimated_duration_minutes" <= 480))),
    CONSTRAINT "daily_routines_intensity_check" CHECK ((("intensity")::"text" = ANY ((ARRAY['low'::character varying, 'moderate'::character varying, 'high'::character varying, 'very_high'::character varying])::"text"[]))),
    CONSTRAINT "daily_routines_status_check" CHECK ((("status")::"text" = ANY ((ARRAY['planned'::character varying, 'in_progress'::character varying, 'completed'::character varying, 'skipped'::character varying])::"text"[])))
);


ALTER TABLE "public"."daily_routines" OWNER TO "postgres";


COMMENT ON TABLE "public"."daily_routines" IS 'Rutinas de ejercicio organizadas por día de la semana';



COMMENT ON COLUMN "public"."daily_routines"."routine_date" IS 'Fecha específica para la cual está programada la rutina';



COMMENT ON COLUMN "public"."daily_routines"."status" IS 'Estado de la rutina: planned, in_progress, completed, skipped';



COMMENT ON COLUMN "public"."daily_routines"."estimated_duration_minutes" IS 'Duración estimada total de la rutina en minutos';



COMMENT ON COLUMN "public"."daily_routines"."estimated_calories" IS 'Calorías estimadas a quemar en toda la rutina';



COMMENT ON COLUMN "public"."daily_routines"."goals" IS 'Objetivos de la rutina: strength, cardio, flexibility, etc.';



COMMENT ON COLUMN "public"."daily_routines"."warm_up_notes" IS 'Notas sobre calentamiento';



COMMENT ON COLUMN "public"."daily_routines"."cool_down_notes" IS 'Notas sobre enfriamiento';



COMMENT ON COLUMN "public"."daily_routines"."started_at" IS 'Momento en que se inició la rutina';



COMMENT ON COLUMN "public"."daily_routines"."completed_at" IS 'Momento en que se completó la rutina';



COMMENT ON COLUMN "public"."daily_routines"."actual_duration_minutes" IS 'Duración real que tomó completar la rutina';



COMMENT ON COLUMN "public"."daily_routines"."completion_notes" IS 'Notas sobre la ejecución de la rutina';



CREATE TABLE IF NOT EXISTS "public"."exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" character varying(255) NOT NULL,
    "description" "text",
    "category" character varying(100) NOT NULL,
    "difficulty" character varying(50) NOT NULL,
    "muscle_groups" "text"[] NOT NULL,
    "equipment" "text"[] NOT NULL,
    "instructions" "text"[] NOT NULL,
    "estimated_duration" integer,
    "calories" integer,
    "image_url" "text",
    "video_url" "text",
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "exercises_category_check" CHECK ((("category")::"text" = ANY ((ARRAY['strength'::character varying, 'cardio'::character varying, 'flexibility'::character varying, 'endurance'::character varying, 'balance'::character varying, 'functional'::character varying])::"text"[]))),
    CONSTRAINT "exercises_difficulty_check" CHECK ((("difficulty")::"text" = ANY ((ARRAY['beginner'::character varying, 'intermediate'::character varying, 'advanced'::character varying])::"text"[])))
);


ALTER TABLE "public"."exercises" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."routine_exercises" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "daily_routine_id" "uuid" NOT NULL,
    "exercise_id" "uuid" NOT NULL,
    "order_in_routine" integer NOT NULL,
    "exercise_type" character varying(20) DEFAULT 'sets_reps'::character varying NOT NULL,
    "sets" integer,
    "reps" integer,
    "weight" numeric(5,2),
    "duration_seconds" integer,
    "distance_meters" numeric(6,2),
    "rest_seconds" integer DEFAULT 60,
    "notes" "text",
    "intensity" character varying(20),
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "routine_exercises_distance_meters_check" CHECK (("distance_meters" >= (0)::numeric)),
    CONSTRAINT "routine_exercises_duration_seconds_check" CHECK (("duration_seconds" > 0)),
    CONSTRAINT "routine_exercises_exercise_type_check" CHECK ((("exercise_type")::"text" = ANY ((ARRAY['sets_reps'::character varying, 'time_based'::character varying, 'distance'::character varying, 'reps_only'::character varying])::"text"[]))),
    CONSTRAINT "routine_exercises_intensity_check" CHECK ((("intensity")::"text" = ANY ((ARRAY['light'::character varying, 'moderate'::character varying, 'intense'::character varying])::"text"[]))),
    CONSTRAINT "routine_exercises_order_in_routine_check" CHECK (("order_in_routine" > 0)),
    CONSTRAINT "routine_exercises_reps_check" CHECK (("reps" > 0)),
    CONSTRAINT "routine_exercises_rest_seconds_check" CHECK (("rest_seconds" >= 0)),
    CONSTRAINT "routine_exercises_sets_check" CHECK (("sets" > 0)),
    CONSTRAINT "routine_exercises_weight_check" CHECK (("weight" >= (0)::numeric))
);


ALTER TABLE "public"."routine_exercises" OWNER TO "postgres";


COMMENT ON TABLE "public"."routine_exercises" IS 'Ejercicios específicos dentro de cada rutina diaria con configuraciones de series, repeticiones, etc.';



COMMENT ON COLUMN "public"."routine_exercises"."order_in_routine" IS 'Orden del ejercicio en la rutina (1, 2, 3...)';



COMMENT ON COLUMN "public"."routine_exercises"."exercise_type" IS 'Tipo de ejercicio: sets_reps, time_based, distance, reps_only';



COMMENT ON COLUMN "public"."routine_exercises"."sets" IS 'Número de series (para sets_reps)';



COMMENT ON COLUMN "public"."routine_exercises"."reps" IS 'Número de repeticiones por serie (para sets_reps o reps_only)';



COMMENT ON COLUMN "public"."routine_exercises"."weight" IS 'Peso en kg (para ejercicios con peso)';



COMMENT ON COLUMN "public"."routine_exercises"."duration_seconds" IS 'Duración en segundos (para time_based)';



COMMENT ON COLUMN "public"."routine_exercises"."distance_meters" IS 'Distancia en metros (para distance)';



COMMENT ON COLUMN "public"."routine_exercises"."rest_seconds" IS 'Tiempo de descanso en segundos después del ejercicio';



COMMENT ON COLUMN "public"."routine_exercises"."notes" IS 'Notas específicas para este ejercicio (técnica, modificaciones, etc.)';



COMMENT ON COLUMN "public"."routine_exercises"."intensity" IS 'Intensidad específica: light, moderate, intense';



CREATE TABLE IF NOT EXISTS "public"."user_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "supabase_id" "uuid" NOT NULL,
    "email" character varying(255) NOT NULL,
    "full_name" character varying(255),
    "avatar_url" "text",
    "role" character varying(20) DEFAULT 'user'::character varying NOT NULL,
    "created_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "timezone"('utc'::"text", "now"()) NOT NULL,
    CONSTRAINT "user_profiles_role_check" CHECK ((("role")::"text" = ANY ((ARRAY['admin'::character varying, 'user'::character varying])::"text"[])))
);


ALTER TABLE "public"."user_profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."daily_routines"
    ADD CONSTRAINT "daily_routines_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."exercises"
    ADD CONSTRAINT "exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "routine_exercises_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "unique_order_per_routine" UNIQUE ("daily_routine_id", "order_in_routine");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_profiles"
    ADD CONSTRAINT "user_profiles_supabase_id_key" UNIQUE ("supabase_id");



CREATE INDEX "idx_daily_routines_date_status" ON "public"."daily_routines" USING "btree" ("routine_date", "status");



CREATE INDEX "idx_daily_routines_routine_date" ON "public"."daily_routines" USING "btree" ("routine_date");



CREATE INDEX "idx_daily_routines_status" ON "public"."daily_routines" USING "btree" ("status");



CREATE INDEX "idx_exercises_category" ON "public"."exercises" USING "btree" ("category");



CREATE INDEX "idx_exercises_difficulty" ON "public"."exercises" USING "btree" ("difficulty");



CREATE INDEX "idx_exercises_muscle_groups" ON "public"."exercises" USING "gin" ("muscle_groups");



CREATE INDEX "idx_routine_exercises_exercise_id" ON "public"."routine_exercises" USING "btree" ("exercise_id");



CREATE INDEX "idx_routine_exercises_order" ON "public"."routine_exercises" USING "btree" ("daily_routine_id", "order_in_routine");



CREATE INDEX "idx_routine_exercises_routine_id" ON "public"."routine_exercises" USING "btree" ("daily_routine_id");



CREATE UNIQUE INDEX "idx_unique_routine_per_date" ON "public"."daily_routines" USING "btree" ("routine_date");



CREATE INDEX "idx_user_profiles_email" ON "public"."user_profiles" USING "btree" ("email");



CREATE INDEX "idx_user_profiles_supabase_id" ON "public"."user_profiles" USING "btree" ("supabase_id");



CREATE OR REPLACE TRIGGER "update_daily_routines_updated_at" BEFORE UPDATE ON "public"."daily_routines" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_exercises_updated_at" BEFORE UPDATE ON "public"."exercises" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_routine_exercises_updated_at" BEFORE UPDATE ON "public"."routine_exercises" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "routine_exercises_daily_routine_id_fkey" FOREIGN KEY ("daily_routine_id") REFERENCES "public"."daily_routines"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."routine_exercises"
    ADD CONSTRAINT "routine_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercises"("id") ON DELETE CASCADE;



CREATE POLICY "Allow public read access" ON "public"."exercises" FOR SELECT USING (true);



CREATE POLICY "Service role can manage all profiles" ON "public"."user_profiles" USING (true) WITH CHECK (true);



CREATE POLICY "Users can read their own profile" ON "public"."user_profiles" FOR SELECT USING (("auth"."uid"() = "supabase_id"));



CREATE POLICY "Users can update their own profile" ON "public"."user_profiles" FOR UPDATE USING (("auth"."uid"() = "supabase_id"));



ALTER TABLE "public"."daily_routines" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."routine_exercises" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";



GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "anon";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."rls_auto_enable"() TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";



GRANT ALL ON TABLE "public"."daily_routines" TO "anon";
GRANT ALL ON TABLE "public"."daily_routines" TO "authenticated";
GRANT ALL ON TABLE "public"."daily_routines" TO "service_role";



GRANT ALL ON TABLE "public"."exercises" TO "anon";
GRANT ALL ON TABLE "public"."exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."exercises" TO "service_role";



GRANT ALL ON TABLE "public"."routine_exercises" TO "anon";
GRANT ALL ON TABLE "public"."routine_exercises" TO "authenticated";
GRANT ALL ON TABLE "public"."routine_exercises" TO "service_role";



GRANT ALL ON TABLE "public"."user_profiles" TO "anon";
GRANT ALL ON TABLE "public"."user_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_profiles" TO "service_role";



ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";







