-- Performance indices for hot lookups

CREATE INDEX "users_role_idx" ON "users"("role");

CREATE INDEX "assessments_mentor_id_idx" ON "assessments"("mentor_id");

CREATE INDEX "assessments_criterion_id_idx" ON "assessments"("criterion_id");
