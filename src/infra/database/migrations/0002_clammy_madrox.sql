ALTER TABLE "template_reccurent" ALTER COLUMN "installments" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "template_reccurent" ALTER COLUMN "start_date" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "template_reccurent" ALTER COLUMN "start_date" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "template_reccurent" ADD COLUMN "count_paid" integer DEFAULT 0 NOT NULL;