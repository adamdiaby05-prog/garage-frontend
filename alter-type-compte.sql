ALTER TABLE utilisateurs
  MODIFY COLUMN type_compte ENUM('admin','mecanicien','client','garage') NOT NULL;
UPDATE utilisateurs SET type_compte='garage' WHERE type_compte='mecanicien';
