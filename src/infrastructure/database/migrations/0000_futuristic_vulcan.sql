CREATE TYPE "public"."frequency" AS ENUM('daily', 'weekly', 'monthly', 'yearly');--> statement-breakpoint
CREATE TYPE "public"."status" AS ENUM('ativo', 'pausado', 'terminado');--> statement-breakpoint
CREATE TYPE "public"."types" AS ENUM('debito', 'credito', 'investimento');--> statement-breakpoint
CREATE TABLE "categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"label" varchar(30) NOT NULL,
	"description" varchar(100) NOT NULL,
	"type" "types" NOT NULL,
	"user_id" uuid
);
--> statement-breakpoint
CREATE TABLE "movements" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" "types" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"category_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"reccurent_id" uuid,
	"executed_at" timestamp with time zone DEFAULT now(),
	"due_date" timestamp with time zone,
	CONSTRAINT "chck_amount_gt0" CHECK ("movements"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY NOT NULL,
	"token" varchar(96) NOT NULL,
	"user_id" uuid NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "sessions_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "template_reccurent" (
	"id" uuid PRIMARY KEY NOT NULL,
	"type" "types" NOT NULL,
	"status" "status" NOT NULL,
	"description" text NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"frequency" "frequency" NOT NULL,
	"interval" integer NOT NULL,
	"installments" integer DEFAULT 0,
	"category_id" uuid NOT NULL,
	"wallet_id" uuid NOT NULL,
	"start_date" timestamp with time zone DEFAULT now(),
	"end_date" timestamp with time zone,
	"next_due_date" timestamp with time zone,
	CONSTRAINT "chck_amount_gt0" CHECK ("template_reccurent"."amount" > 0),
	CONSTRAINT "chck_interval_gt0" CHECK ("template_reccurent"."interval" > 0),
	CONSTRAINT "chck_start_before_end" CHECK ("template_reccurent"."end_date" > "template_reccurent"."start_date"),
	CONSTRAINT "chck_start_before_nextdue" CHECK ("template_reccurent"."next_due_date" > "template_reccurent"."start_date"),
	CONSTRAINT "chck_end_afterOrEqual_nextdue" CHECK ("template_reccurent"."end_date" >= "template_reccurent"."next_due_date")
);
--> statement-breakpoint
CREATE TABLE "transfers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"debited_wallet" uuid NOT NULL,
	"credited_wallet" uuid NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "chck_contas_diferentes" CHECK ("transfers"."credited_wallet" != "transfers"."debited_wallet"),
	CONSTRAINT "chck_amount_maior_q_0" CHECK ("transfers"."amount" > 0)
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY NOT NULL,
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
CREATE TABLE "wallets" (
	"id" uuid PRIMARY KEY NOT NULL,
	"label_name" varchar(20) NOT NULL,
	"owner_id" uuid NOT NULL,
	"balance" numeric(12, 2) DEFAULT '0',
	"updated_at" timestamp with time zone DEFAULT now(),
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "categories" ADD CONSTRAINT "categories_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "movements" ADD CONSTRAINT "movements_reccurent_id_template_reccurent_id_fk" FOREIGN KEY ("reccurent_id") REFERENCES "public"."template_reccurent"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_reccurent" ADD CONSTRAINT "template_reccurent_category_id_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "template_reccurent" ADD CONSTRAINT "template_reccurent_wallet_id_wallets_id_fk" FOREIGN KEY ("wallet_id") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_debited_wallet_wallets_id_fk" FOREIGN KEY ("debited_wallet") REFERENCES "public"."wallets"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transfers" ADD CONSTRAINT "transfers_credited_wallet_wallets_id_fk" FOREIGN KEY ("credited_wallet") REFERENCES "public"."wallets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallets" ADD CONSTRAINT "wallets_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "session_user_id_idx" ON "sessions" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "name_idx" ON "users" USING btree ("first_name","last_name");--> statement-breakpoint
CREATE INDEX "features_idx" ON "users" USING btree ("features");--> statement-breakpoint
CREATE INDEX "idx_labelName" ON "wallets" USING btree ("label_name");