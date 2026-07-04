ALTER TABLE "movements" ALTER COLUMN "executed_at" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "movements" ALTER COLUMN "executed_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "owner_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "balance" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "updated_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "wallets" ALTER COLUMN "created_at" SET NOT NULL;