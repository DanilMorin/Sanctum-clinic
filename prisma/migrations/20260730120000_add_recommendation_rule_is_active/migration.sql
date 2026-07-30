-- Keep historical recommendation rules linked to quiz sessions while allowing
-- the versioned catalog to deactivate rules that are no longer present.
ALTER TABLE `recommendation_rules`
  ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true;

CREATE INDEX `recommendation_rules_isActive_idx`
  ON `recommendation_rules`(`isActive`);
