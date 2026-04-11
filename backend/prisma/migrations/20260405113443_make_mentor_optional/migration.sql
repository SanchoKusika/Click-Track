-- DropForeignKey
ALTER TABLE "intern_profiles" DROP CONSTRAINT "intern_profiles_mentor_id_fkey";

-- AlterTable
ALTER TABLE "intern_profiles" ALTER COLUMN "mentor_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "intern_profiles" ADD CONSTRAINT "intern_profiles_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
