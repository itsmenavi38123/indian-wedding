-- Make WeddingPlan.userId nullable for guest mode support
-- Guest mode creates WeddingPlans without a user, which gets assigned when user claims the plan

ALTER TABLE "WeddingPlan" ALTER COLUMN "userId" DROP NOT NULL;
