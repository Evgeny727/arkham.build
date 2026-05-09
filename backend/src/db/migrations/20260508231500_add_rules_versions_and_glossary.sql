-- migrate:up

CREATE TABLE rules_version (
  citation VARCHAR(255) PRIMARY KEY,
  date DATE NOT NULL
);

ALTER TABLE errata
  ALTER COLUMN citation TYPE VARCHAR(255);

ALTER TABLE faq
  ALTER COLUMN citation TYPE VARCHAR(255);

ALTER TABLE errata
  ADD CONSTRAINT errata_citation_fkey
  FOREIGN KEY (citation) REFERENCES rules_version(citation) NOT VALID;

ALTER TABLE faq
  ADD CONSTRAINT faq_citation_fkey
  FOREIGN KEY (citation) REFERENCES rules_version(citation) NOT VALID;

CREATE TABLE glossary_entry (
  id INT PRIMARY KEY,
  section VARCHAR(255) NOT NULL,
  ruling TEXT,
  translations JSONB NOT NULL,
  citation VARCHAR(255) NOT NULL REFERENCES rules_version(citation)
);

CREATE TABLE glossary_entry_reference (
  source_id INT NOT NULL REFERENCES glossary_entry(id) ON DELETE CASCADE,
  target_id INT NOT NULL REFERENCES glossary_entry(id) ON DELETE CASCADE,
  position INT NOT NULL,
  PRIMARY KEY (source_id, target_id),
  UNIQUE (source_id, position)
);

CREATE INDEX idx_glossary_entry_citation ON glossary_entry(citation);
CREATE INDEX idx_glossary_entry_reference_target_id ON glossary_entry_reference(target_id);

-- migrate:down
