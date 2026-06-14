CREATE TABLE "account" (
        "userId" text NOT NULL,
        "type" text NOT NULL,
        "provider" text NOT NULL,
        "providerAccountId" text NOT NULL,
        "refresh_token" text,
        "access_token" text,
        "expires_at" integer,
        "token_type" text,
        "scope" text,
        "id_token" text,
        "session_state" text,
        CONSTRAINT "account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId")
);

CREATE TABLE "character_state" (
        "user_id" text NOT NULL,
        "character_id" text NOT NULL,
        "intimacy_stage" integer DEFAULT 1 NOT NULL,
        "intimacy_score" integer DEFAULT 0 NOT NULL,
        "character_data" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "character_state_user_id_character_id_pk" PRIMARY KEY("user_id","character_id")
);

CREATE TABLE "conversation" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "character_id" text NOT NULL,
        "role" text NOT NULL,
        "content" text NOT NULL,
        "intimacy_stage" integer DEFAULT 1 NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "email_unsubscribe" (
        "email" text NOT NULL,
        "token" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "intimacy_event" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" text NOT NULL,
        "character_id" text NOT NULL,
        "from_stage" integer NOT NULL,
        "to_stage" integer NOT NULL,
        "reason" text NOT NULL,
        "judge_raw" text,
        "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "session" (
        "sessionToken" text PRIMARY KEY NOT NULL,
        "userId" text NOT NULL,
        "expires" timestamp NOT NULL
);

CREATE TABLE "user_profile" (
        "user_id" text NOT NULL,
        "character_id" text NOT NULL,
        "display_name" text,
        "preferences" text DEFAULT '{}' NOT NULL,
        "forbidden_touched" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "user_profile_user_id_character_id_pk" PRIMARY KEY("user_id","character_id")
);

CREATE TABLE "user" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text,
        "email" text,
        "emailVerified" timestamp,
        "image" text,
        "onboarded_at" timestamp,
        "email_opt_in" boolean DEFAULT true,
        "last_seen_at" timestamp
);

CREATE TABLE "verificationToken" (
        "identifier" text NOT NULL,
        "token" text NOT NULL,
        "expires" timestamp NOT NULL,
        CONSTRAINT "verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token")
);

ALTER TABLE "account" ADD CONSTRAINT "account_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "character_state" ADD CONSTRAINT "character_state_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "conversation" ADD CONSTRAINT "conversation_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "intimacy_event" ADD CONSTRAINT "intimacy_event_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "session" ADD CONSTRAINT "session_userId_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;
CREATE UNIQUE INDEX "unsub_email_idx" ON "email_unsubscribe" USING btree ("email");
