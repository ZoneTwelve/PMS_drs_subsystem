CREATE TABLE `ncu7221`.`DRS_sheets` (
  `sheet_id` INT NOT NULL AUTO_INCREMENT,
  `time` DATETIME NULL,
  `dorm` VARCHAR(45) NULL,
  `location` VARCHAR(45) NULL,
  `reporter` VARCHAR(45) NULL,
  PRIMARY KEY (`sheet_id`));
