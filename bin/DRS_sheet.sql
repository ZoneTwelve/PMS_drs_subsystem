-- Date: 2021/05/12 16:06
-- Dormitory Report System sheet
CREATE TABLE `ncu7221`.`DRS_sheets` (
  `sheet_id` INT NOT NULL AUTO_INCREMENT,
  `time` DATETIME NULL,
  `dorm` VARCHAR(45) NULL,
  `location` VARCHAR(45) NULL,
  `reporter` VARCHAR(45) NULL,
  `formid` INT NULL,
  PRIMARY KEY (`sheet_id`));

/*
Change tables:
ALTER TABLE `ncu7221`.`DRS_sheets` 
CHANGE COLUMN `sheet_id` `sheet_id` INT NOT NULL ;

*/
