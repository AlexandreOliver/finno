CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"first_name" varchar(30) NOT NULL,
	"last_name" varchar(50) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(60) NOT NULL,
	"features" text[] DEFAULT '{}'::text[] NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE INDEX "name_idx" ON "users" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "features_idx" ON "users" USING btree ("features");